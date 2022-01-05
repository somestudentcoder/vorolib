import { Model } from './model';
import { View } from './view';
import { Controller } from './controller';
import chroma from 'chroma-js';

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

    getSVG(){
      return controller.getSVGshot();
    }

    changeColorScheme(colors: string[]){
      model.colorScale = chroma.scale(colors);
      try{
        model.setNewColorScheme(model.colorScale);
      }
      catch{
        model.callbackFlag = true;
        console.log('[Color] action will be executed once data has loaded.')
      }
    }

    setCellPlacementStatic(flag: boolean){
      model.setStaticConstruction(flag);
    }

    setFontSizeStatic(flag: boolean){
      model.setFontSizeStatic(flag);
    }

    changeWeightAttribute(name: string){
      try{
        model.setWeightAttribute(name);
      }
      catch{
        model.weight_attribute = name;
        model.callbackFlag = true;
        console.log('[Weight] action will be executed once data has loaded.')
      }
    }

    setCallbackFunction(fun: Function){
      try{
        controller.setCallbackFunctionToPolygons(fun, model.root_polygon);
      }
      catch{
        model.callback = fun;
        model.callbackFlag = true;
        console.log('[Callback] action will be executed once data has loaded.')
      }
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