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
            csv(data)
              .then((csvData) => {
                let root = stratify()
                  .id(function (d:any = {}) { return d.name; })
                  .parentId(function (d:any = {}) { return d.parent; })
                  (csvData);
                model.assignWeights(root.leaves(), model.weight_attribute);
                model.createTreemap(root);
              })
              .catch(() => {
                window.alert("Could not load example.");
              })
        }
        else{
            json(data)
                .then((jsonData) => {
                    let root = hierarchy(jsonData);
                    model.assignWeights(root.leaves(), model.weight_attribute);
                    model.createTreemap(root);
            })
            .catch(() => {
                window.alert("Could not load example.");
            })
        }
    }
}