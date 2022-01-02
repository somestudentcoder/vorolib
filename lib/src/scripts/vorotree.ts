import {csv, json} from "d3-fetch";
import {hierarchy, HierarchyNode, stratify} from "d3-hierarchy";
import { Model } from './model';
import { View } from './view';
import { Controller } from './controller';


declare global {
   var model: Model;
   var view: View;
   var controller: Controller;
}

export class VoroTree{

    constructor(data: string, element: string, w: number, h: number){


        window.model = new Model();
        window.view = new View(element, w, h);
        window.controller = new Controller();

        if(data.split('.').pop() == 'csv'){
            model.loadCSVFile(data);
        }
        else if(data.split('.').pop() == 'json'){
            model.loadJSONFile(data);
        }
    }

    openFile(file: any){
      model.computeVoronoi(file);
    }

    loadCSVFile(name: string){
      model.loadCSVFile(name);
    }

    loadJSONFile(name: string){
      model.loadJSONFile(name);
    }

    exportSVG(){
      controller.takeSVGshot();
    }

    changeColorScheme(colors: string[]){
      model.setNewColorScheme(colors);
    }

    setCellPlacementStatic(flag: boolean){
      model.setStaticConstruction(flag);
    }

    setFontSizeStatic(flag: boolean){
      model.setFontSizeStatic(flag);
    }

    changeWeightAttribute(){

    }

    setCallbackFunction(){

    }

    getData(){
      return model.root_polygon;
    }

    resetView(){
      view.resetViewpoint();
    }

    redraw(){
      view.showTreemap(model.current_root_polygon);
    }

    resize(w:number, h:number){
      view.resizeTo(w, h);
    }

}