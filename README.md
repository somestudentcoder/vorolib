# VoroLib #

## Quick Start ##

The repository contains an example quickstart scenario for using VoroLib including all the necessary parts. The
example can be found in the /docs folder and is also hosted under [GitHub Pages](https://somestudentcoder.github.io/vorolib/).
Please note that the webpage must be hosted in an http server, otherwise Cross-Origin protocols will stop VoroLib from loading.

All you need to run a VoroLib visualization on your page is:

* An HTML page that includes 'vorolib.js'.
* A .csv or .json file with your data in the correct format (format explained below).
* An HTMLElement that will hold the visualization, i.e. a div.

By calling the VoroTree constructor you can start the visualization on your page:

```js
  var myVis = new VoroLib.VoroTree(<string>[data-path], <string>[id of HTMLElement], <number>[width], <number>[height])
```

As can be seen in the example call in the repository, an example call could look like:

```js
  var myVis = new VoroLib.VoroTree("cars.csv", "visualization", 500, 500)
```

This will give you a standard looking VoroLib visualization within the HTMLElement specified. To further customize, use
the VoroTree methods listed below.

## Methods ##

* **Open a File**

  ```js
  myVis.openFile(<any> file);
  ```

  Opens the specified file taken from an HTML input object. The data will then be loaded into the visualization.
  Example:

  ```js
  const inputObject = <HTMLInputElement> document.getElementById("input");
  inputObject.addEventListener("change", function(){
    myVis.openFile(inputObject.files);
  })
  ```

* **Load .CSV from path**

  ```js
  myVis.loadCSVFile(<string> file-path);
  ```

  Opens the specified .csv file at the specified path. The data will then be loaded into the visualization.
  Example:

  ```js
  myVis.loadCSVFile("data.csv");
  ```

* **Load .JSON from path**

  ```js
  myVis.loadJSONFile(<string> file-path);
  ```

  Opens the specified .json file at the specified path. The data will then be loaded into the visualization.
  Example:

  ```js
  myVis.loadJSONFile("data.json");
  ```

* **Get current view as SVG**

  ```js
  myVis.getSVG();
  ```

  Draws and returns a SVG of the current view in the visualization. Example:

  ```js
  let svg = myVis.getSVG();
  ```

* **Export current view as SVG**

  ```js
  myVis.exportSVG();
  ```

  Draws a SVG of the current view in the visualization and prompt the user to open or download it.
* **Change color scheme**

  ```js
  myVis.changeColorScheme(<string[]> color-scheme);
  ```

  Takes one or more colors in hex to construct a color scale over the 2D space.
  Example:

    ```js
    myVis.changeColorScheme(['#ff0000', '#ffb300', '#3afa00']);
    ```

* **Change cell placement**

  ```js
  myVis.setCellPlacementStatic(<boolean> value);
  ```

  Defines if on reloads of the data, the visualization always remains the same (static) or
  if the visualization varies after each reload. Default is set to true.
  Example:

  ```js
  myVis.setCellPlacementStatic(false);
  ```

* **Change font size**

  ```js
  myVis.setFontSizeStatic(<boolean> value);
  ```

  Defines if font size is relative to cell size or is to remain the same over all cells (static).
  Default is set to false.
  Example:

  ```js
  myVis.setFontSizeStatic(true);
  ```

* **Change weighted attribute**

  ```js
  myVis.changeWeightAttribute(<string> name of weight attribute);
  ```

  Defines which attribute in the data is chosen for weighting the visualization. Attribute must be present in the data!
  Default is 'weight'. If weight is not specified, the size is based on number of children.
  Example:

  ```js
  myVis.changeWeightAttribute('age');
  ```

* **Set a callback function**

  ```js
  myVis.setCallbackFunction(<Function> cb);
  ```

  Sets a callback function to leaf cells. The function is called when leaf cells are tapped/clicked.
  Example:

  ```js
  myVis.setCallbackFunction(() => {window.alert('hi')});
  ```

* **Get the data in VoroLib format**

  ```js
  myVis.getData();
  ```

  Returns the root Polygon of the visualization, which includes the entire data in VoroLib format.
  For PIXI methods and members please consult the [PixiJS API](https://pixijs.download/dev/docs/PIXI.Graphics.html).
  Data structure:

  ```js
  class Polygon extends PIXI.Graphics{
    public center: Point                    // X and Y coordinates of the center of the polygon.
    public points: Array<Point>             // The points the polygon is made up of.
    public polygon_children: Array<Polygon> // All children of this polygon.
    public polygon_parent: Polygon          // The parent of this polygon.
    public color: number[]                  // Color array. The color at color[0] is the one that is used for this polygon.
    public id: number                       // ID of polygon.
    public name: string                     // Name of polygon.
    public path: string                     // Path of polygon (only if imported from folder structure).
    public callbackFunction: Function       // The callback function of this polygon.
    public functionFlag: boolean            // Boolean that indicates whether cb function is active.
  }
  ```

* **Reset the View**

  ```js
  myVis.resetView();
  ```

  Sets the visualization to its initial state with the root polygon being in view.

* **Redraw visualization**

  ```js
  myVis.redraw();
  ```

  Redraws the visualization in its current state. Can be useful when changing small things and then refreshing without the user noticing.

* **Resize visualization**

  ```js
  myVis.resize(<number> width, <number> height);
  ```

  Resizes the visualization and redraws it to the selected width and height.
  Example:

  ```js
  myVis.resize(800, 800);
  ```

## Gulp Commands ##

Commands should be run under a **bash** shell.

The following command runs a http server under /docs to demonstrate the example locally.

  ```bash
  $> npx gulp serve
  ```

The following command builds VoroLib to the dist folder.

  ```bash
  $> npx gulp build
  ```

The following command cleans the "dist" folder which includes the bundled source code.

  ```bash
  $> npx gulp clean
  ```

The following command cleans the "dist" folder which includes the bundled source code,
as well as the "node_modules" folder.

  ```bash
  $> npx gulp cleanAll
  ```

The following command contstructs a .json dataset from a specified folder. This folder
can then be viewed and navigated within VoroTree. Specify input folder and output name
in the "/data/folderdatasetconfig.js" file.

  ```bash
  $> npx gulp constructFolderDataset
  ```

## Data Model ##

The tool supports JSON and CSV files which need to have the following format in order to visualize the data properly.

* **Name** is used as the label of the polygon.
* **Children** or **Parent**, depending on the filetype used, define the hierarchical nature of your data.
* **Weight** influences the size of the polygon. Only the leaves should have this property. If the weight is not given, the size of the polygon depends on the amount of children.
* Any other attributes of a data point that are a number are automatically added to the settings menu as a weight accessor. So any other numerical attributes in your data can also be used to weight the visualization i.e. **Size**, **Age** etc..

### JSON Example ###

```json

{
      "name": "America",
      "children": [
        {
          "name": "North America",
          "children": [
            {"name": "United States", "weight": 24.32},
            {"name": "Canada", "weight": 2.09},
            {"name": "Mexico", "weight": 1.54}
          ]
        },
        {
          "name": "South America",
          "children": [
            {"name": "Brazil", "weight": 2.39},
            {"name": "Argentina", "weight": 0.79},
            {"name": "Venezuela", "weight": 0.5},
            {"name": "Colombia", "weight": 0.39}
          ]
        }
      ]
}


```

### CSV Examples ###

To create a Voronoi Treemap from a CSV file, the columns **name** and **parent** are required. The **weight** is optional as described above.

```csv
 name,parent,weight
 cars,,
 owned,cars,
 traded,cars,
 learned,cars,
 pilot,owned,40
 325ci,owned,40
 accord,owned,20
 chevette,traded,10
 odyssey,learned,20
 maxima,learned,10
```

However if parents are not unique, the tool requires **id**, **name** and **parentId** to create a hierarchy from this data set.

```csv
id,name,parentId,weight
1,Father,,
2,Alice,1,
3,Alice,1,
4,Bob,2,10
5,Doris,3,20
```
