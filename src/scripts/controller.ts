import { Polygon } from './polygon';
import * as PIXI from 'pixi.js';

//this decides how large a polygon must be on screen to be entered. (using wheel/pinch)
let ZOOMDIMENSIONRATIO = 0.50;

export class Controller{

  private lastPinchWidth: number = view.width;

  public highlightedPolygon: Polygon = {} as Polygon;

  constructor()
  {

  }
 
  polgyonClick(x: number, y: number)
  {
    for(let child of model.current_root_polygon.polygon_children){
      if (child.hitArea.contains(x, y)) {
        if(child.functionFlag == true){
          child.callbackFunction();
        }
        if(child.polygon_children.length == 0){
          return;
        }
        this.moveTo(child);
        return;
      }
    }
    if(model.current_root_polygon != model.root_polygon){
      this.moveTo(model.current_root_polygon.polygon_parent);
      if(model.current_root_polygon.polygon_parent.functionFlag == true){
        model.current_root_polygon.polygon_parent.callbackFunction();
      }
      return;
    }
  }

  takeSVGshot(){
    let screenshot = view.constructSVG();
    this.downloadImage("screenshot.svg", screenshot);
  }

  downloadImage(name: string, href: any){
    var link = document.createElement('a');
    link.download = name;
    link.style.opacity = '0';
    link.href = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(href);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  moveTo(target: Polygon){
    let ratio = this.calculateZoomFactor(target)
    view.viewport.snapZoom({removeOnComplete: true, height: view.viewport.worldScreenHeight * ratio, center: new PIXI.Point(target.center.x, target.center.y), time: 1200, removeOnInterrupt: true});
    this.setZoomFactor(target, ratio);
    view.showTreemap(model.current_root_polygon);
  }

  pinchStart(){
    this.lastPinchWidth = view.viewport.screenWidthInWorldPixels;
  }

  pinched(){
    let dimensions = {
      dy: view.viewport.screenWidthInWorldPixels - this.lastPinchWidth
    };
    this.wheeled(dimensions, view.viewport.center.x, view.viewport.center.y);
  }

  wheeled(e: any, x: number, y: number){
    if(e.dy < 0){
      let target: Polygon = {} as Polygon;
      for(let child of model.current_root_polygon.polygon_children){
        if (child.hitArea.contains(x, y)) {
          if(child.polygon_children.length == 0){
            break;
          }
          target = child;
          break;
        }
      }
      if(target != null){
        if((view.width >= view.height &&
          view.viewport.screenWidthInWorldPixels * ZOOMDIMENSIONRATIO < target.width)
          || 
          (view.width < view.height &&
            view.viewport.screenHeightInWorldPixels * ZOOMDIMENSIONRATIO < target.height)){
          let ratio = this.calculateZoomFactor(target)
          this.setZoomFactor(target, ratio)
          view.showTreemap(target);
        }
      }
    }
    else if(model.current_root_polygon != model.root_polygon
      && (view.viewport.screenWidthInWorldPixels * ZOOMDIMENSIONRATIO > model.current_root_polygon.width
          || view.viewport.screenWidthInWorldPixels == view.width))
    {
      let ratio = this.calculateZoomFactor(model.current_root_polygon.polygon_parent)
      this.setZoomFactor(model.current_root_polygon.polygon_parent, ratio)
      view.showTreemap(model.current_root_polygon);
    }
  }

  setZoomFactor(target: Polygon, ratio: number){
    if(target == model.root_polygon){
      view.zoom_factor = 1
    }
    else{
      view.zoom_factor = (view.viewport.screenWidthInWorldPixels * ratio) / view.width;
    }
    model.current_root_polygon = target;
  }

  calculateZoomFactor(polygon: Polygon){
    let xmin = polygon.points[0].x;
    let xmax = polygon.points[0].x;
    let ymin = polygon.points[0].y;
    let ymax = polygon.points[0].y;
    for(let p of polygon.points){
      if (p.x < xmin){
        xmin = p.x;
      }
      else if(p.x > xmax){
        xmax = p.x;
      }

      if (p.y < ymin){
        ymin = p.y;
      }
      else if(p.y > ymax){
        ymax = p.y;
      }
    }
    let x_ratio = (xmax - xmin) / view.viewport.worldScreenWidth;
    let y_ratio = (ymax - ymin) / view.viewport.worldScreenHeight;
    let larger_ratio = x_ratio >= y_ratio ? x_ratio : y_ratio;
    return larger_ratio;
  }

  setCallbackFunctionToPolygons(fun: Function, parent: Polygon){
    if(parent.polygon_children.length <= 0){return;}
    for(let node of parent.polygon_children){
      if(node.polygon_children.length <= 0){
        node.callbackFunction = fun;
        node.functionFlag = true;
      }
      else{this.setCallbackFunctionToPolygons(fun, node)}
    }
  }
}