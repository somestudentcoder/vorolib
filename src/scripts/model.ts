import { Polygon } from './polygon';
import { Point } from './point';
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import {csv, json} from "d3-fetch";
import { voronoiTreemap } from "d3-voronoi-treemap";
import {csvParse} from "d3-dsv";
import chroma = require('chroma-js');

var seedrandom = require('seedrandom');
let Y_SCALE = chroma.scale(['#000000', '#7d7d7d']);

export class Model{
  public currentPolygonID: number = 0;
  public root_polygon: Polygon = {} as Polygon;
  public current_root_polygon: Polygon = {} as Polygon;
  public lastFileRead: any;
  public lastFileNameRead: string = "";
  public fileReloadSelector: number = -1;
  public staticConstruction: boolean = true;
  public staticFontSize: boolean = false;
  public seed: number = Math.random();
  public prng = seedrandom(this.seed);
  public weight_attribute: string = 'weight'; 
  public colorScale: chroma.Scale = chroma.scale(['#80ff80', '#80ff9f', '#80ffbf', '#7fffd4', '#80ffdf', '#80ffff', '#80dfff', '#80bfff']);
  public callback: (polygon: Polygon) => void = (polygon: Polygon) => {};
  public callbackFlag: boolean = false;


  loadJSONFile(name: string){
    this.refresh()
    json(name)
      .then((jsonData) => {
          let root = hierarchy(jsonData);
          this.assignWeights(root.leaves(), this.weight_attribute);
          this.lastFileNameRead = name;
          this.fileReloadSelector = 2;
          this.createTreemap(root);
      })
      .then(() =>{
        if(model.callbackFlag){
          if(model.weight_attribute != 'weight'){model.setWeightAttribute(model.weight_attribute);}
          model.setNewColorScheme(model.colorScale)
          controller.setCallbackFunctionToPolygons(model.callback, model.root_polygon);
          model.callbackFlag = false;
        }
      })
      .catch((e) => {
        window.alert("Could not load example." + e);
      })
  }

  loadCSVFile(name: string){
    this.refresh()
    csv(name)
      .then((csvData) => {
        let root = stratify()
          .id(function (d:any = {}) { return d.name; })
          .parentId(function (d:any = {}) { return d.parent; })
          (csvData);
        this.assignWeights(root.leaves(), this.weight_attribute);
        this.lastFileNameRead = name;
        this.fileReloadSelector = 1;
        this.createTreemap(root);
      })
      .then(() =>{
        if(model.callbackFlag){
          if(model.weight_attribute != 'weight'){model.setWeightAttribute(model.weight_attribute);}
          model.setNewColorScheme(model.colorScale)
          controller.setCallbackFunctionToPolygons(model.callback, model.root_polygon);
          model.callbackFlag = false;
        }
      })
      .catch((e) => {
        window.alert("Could not load example." + e);
      })
  }

  createRootPolygon(rootNode: HierarchyNode<any>){
    if(rootNode.children == undefined){
      return;
    }
    // let sum = 0;
    // for(let leaf of rootNode.leaves()){
    //   sum += parseInt(this.getWeight(leaf.data));
    // }
    // for(let leaf of rootNode.leaves()){
    //   leaf.data['weight'] = (leaf.data['weight'] * 100) / sum;
    // }
    let polygon = this.getPolygon(rootNode);
    this.root_polygon = Polygon.from(polygon, polygon.site);
    this.root_polygon.center = new Point(view.width / 2, view.height / 2);
    this.current_root_polygon = this.root_polygon;
    this.treemapToPolygons(this.root_polygon, rootNode, true)
  }

  setNewColorScheme(colors: chroma.Scale){
    this.setColorScale(model.root_polygon, this.colorScale)

    view.showTreemap(model.current_root_polygon);
  }

  setColorScale(parent: Polygon, scale: chroma.Scale<chroma.Color>){
    if(parent.polygon_children.length <= 0){
      return;
    }
    for(let node of parent.polygon_children){
      let c1 = scale(node.center.x / view.width);
      let c2 = Y_SCALE(node.center.y / view.height);
      node.color[0] = chroma.mix(c1, c2).num()

      this.setColorScale(node, scale);
    }
  }

  treemapToPolygons(rootPolygon: Polygon, rootNode: HierarchyNode<unknown>, root: boolean){
    if(rootNode.children == undefined){
      return;
    }
    let i = 0;
    for(let node of rootNode.children){
      let poly = this.getPolygon(node);

      let c1 = this.colorScale(poly.site.x / view.width);
      let c2 = Y_SCALE(poly.site.y / view.height);
      let color1 = chroma.mix(c1, c2).num()
      let color2 = chroma.mix(c1, c2).num()
      let color3 = chroma.mix(c1, c2).num()

      let color = [color1, color2, color3]

      let new_poly = Polygon.from(poly, poly.site, rootPolygon, color, this.getPath(node.data));
      new_poly.polygon_parent = rootPolygon;
      new_poly.name = this.getName(node.data);
      this.checkName(new_poly);

      //new_poly.weight = this.calculateWeight(node);

      rootPolygon.polygon_children.push(new_poly);
      this.treemapToPolygons(new_poly, node, false);
      i++;
    }
  }

  getPath(obj: any = {}){
    if(obj.hasOwnProperty('path')){
      return obj.path;
    }
    else{
      return "";
    }
  }

  getName(obj: any = {}){
    return obj.name;
  }

  getPolygon(obj: any = {}){
    return obj.polygon;
  }

  loadRandomPoints(num: number) {
    let pointList = [];
    for(var i = 0; i < num; i++) {
      var x = Math.random() * view.app.renderer.width;
      var y = Math.random() * view.app.renderer.height;
      pointList.push(new Point(x, y));
    }
    return pointList;
  }


  randomIntFromInterval(min: number, max: number) 
  { 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }


  computeVoronoi(files: any)
  {
    this.refresh();
    this.lastFileRead = files;
    this.fileReloadSelector = 0;

    let reader = new FileReader();

    reader.onload = (event: any) => {

      if(event.target != null) {
        let text = event.target.result;
        if(typeof(text) == "string") {

          let root  = files[0].name.split('.').pop() == 'csv' ?
            this.parseCsv(text) :
            this.parseJson(text);

            if(typeof(root) == "undefined") {
              return;
            }

            this.assignWeights(root.leaves(), this.weight_attribute);
            this.createTreemap(root);
        }
      }
    };

    reader.readAsText(files[0]);

  }

  createTreemap(root: HierarchyNode<any>) {
    root.sum(function (d: any = {}) {
      return d.weight;
    });

    if(!this.staticConstruction)
    {
      this.prng = seedrandom(Math.random());
    }

    var voronoitreemap = voronoiTreemap() 
                                      .clip([[0, 0], [0, view.height], [view.width, view.height], [view.width, 0]])
                                      .prng(this.prng);

    voronoitreemap(root);
    this.createRootPolygon(root);
    view.showTreemap(this.root_polygon)
  }
  
  refresh() {
    view.viewport.removeChildren();
    view.resetViewItems();
    this.prng = seedrandom(this.seed);
  }

  assignWeights(leaves: HierarchyNode<any>[], attribute: string) {
  

    if(attribute == 'weight' && !leaves[0].data.hasOwnProperty('weight') || leaves[0].data['weight'] == '') {
      leaves.forEach(function (leaf: HierarchyNode<any>) {
        leaf.data['weight'] = 100 / leaves.length;
        model.weight_attribute = 'children';
      });
    }
    else if(attribute == 'children'){
      leaves.forEach(function (leaf: HierarchyNode<any>) {
        leaf.data['weight'] = 100 / leaves.length;
        model.weight_attribute = 'children';
      });
    }
    else if(attribute != 'weight'){
      leaves.forEach(function (leaf: HierarchyNode<any>) {
        leaf.data['weight'] = leaf.data[attribute];
        model.weight_attribute = attribute;
      });
    }
    else if(attribute == 'weight'){model.weight_attribute = 'weight';}
  }

  hasUniqueParents(columns: string[]) {
    let requiredColumns = ['name', 'parent'];
    return requiredColumns.every(function (column: any = {}) {
      return columns.includes(column);
    });
  }

  hasNonUniqueParents(columns: string[]) {
    let requiredColumns = ['id', 'name', 'parentId'];
    return requiredColumns.every(function (column: any = {}) {
      return columns.includes(column);
    });
  }

  parseCsv(fileContent: any) {
    let parsingRes = csvParse(fileContent);
    let columns = parsingRes.columns;

    if(this.hasUniqueParents(columns)) {
      return stratify()
        .id(function (d:any = {}) { return d.name; })
        .parentId(function (d:any = {}) { return d.parent; })
        (parsingRes);
    } else if(this.hasNonUniqueParents(columns)) {
      return stratify()
        .id(function (d:any = {}) { return d.id; })
        .parentId(function (d:any = {}) { return d.parentId; })
        (parsingRes);
    }

    window.alert("Cannot parse CSV file!");
  }

  parseJson(fileContent: any) {
    let parsingRes = JSON.parse(fileContent);
    return hierarchy(parsingRes);
  }

  loadLastData(){
    if(this.fileReloadSelector == 0){
      this.computeVoronoi(this.lastFileRead);
    }
    else if(this.fileReloadSelector == 1){
      this.loadCSVFile(this.lastFileNameRead);
    }
    else if(this.fileReloadSelector == 2){
      this.loadJSONFile(this.lastFileNameRead);
    }
  }


  checkName(polygon: Polygon)
  {
    if(polygon.name.indexOf('.') > -1 && (polygon.name.split('.'))[0] != "")
    {
      let file_extension = polygon.name.split('.')[polygon.name.split('.').length-1]
      switch(file_extension){
        case "json":
          polygon.name = '🧾' + polygon.name;
          break;
        case "txt":
          polygon.name = '📄' + polygon.name;
          break;
        case "html":
          polygon.name = '📑' + polygon.name;
          break;
        case "doc":
          polygon.name = '📄' + polygon.name;
          break;
        case "docx":
          polygon.name = '📄' + polygon.name;
          break;
        case "pdf":
          polygon.name = '📕' + polygon.name;
          break;
        case "xls":
          polygon.name = '📊' + polygon.name;
          break;
        case "xlsx":
          polygon.name = '📊' + polygon.name;
          break;
        case "ppt":
          polygon.name = '📈' + polygon.name;
          break;
        case "pptx":
          polygon.name = '📈' + polygon.name;
          break;
        case "csv":
          polygon.name = '📊' + polygon.name;
          break;
        case "ts":
          polygon.name = '⌨️' + polygon.name;
          break;
        case "js":
          polygon.name = '⌨️' + polygon.name;
          break;
        case "css":
          polygon.name = '🎨' + polygon.name;
          break;
        case "jpg":
          polygon.name = '🖼️' + polygon.name;
          break;
        case "jpeg":
          polygon.name = '🖼️' + polygon.name;
          break;
        case "png":
          polygon.name = '🖼️' + polygon.name;
          break;
        case "svg":
          polygon.name = '🖼️' + polygon.name;
          break;
        case "mp3":
          polygon.name = '🎵' + polygon.name;
          break;
        case "wav":
          polygon.name = '🎵' + polygon.name;
          break;
        case "zip":
          polygon.name = '🗃️' + polygon.name;
          break;
        case "exe":
          polygon.name = '💽' + polygon.name;
          break;
        case "bin":
          polygon.name = '💽' + polygon.name;
          break;
        case "py":
          polygon.name = '⚙️' + polygon.name;
          break;
        case "bat":
          polygon.name = '⚙️' + polygon.name;
          break;
        default:
          break;
      }
    }
  }

  setStaticConstruction(value: boolean){
    this.staticConstruction = value;
  }

  setFontSizeStatic(value: boolean){
    this.staticFontSize = value;
  }

  setWeightAttribute(value: string){
    this.weight_attribute = value;
    this.loadLastData();
  }
}