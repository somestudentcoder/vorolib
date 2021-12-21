# VoroTree API #

## Quick Start ##

The repository contains an example quickstart scenario for using the VoroTree API including all the necessary parts
. All you need to run VoroTree on your page is:

* An HTML page that includes 'vorotree.js'.
* A .csv or .json file in the correct format (format explained below).
* An HTMLElement that has the id 'vorotree' and **must** contain the following attributes:
  * **data-name** ==> name of the data file.
  * **data-width** ==> width in pixels you wish the visualization to be.
  * **data-height** ==> height in pixels you wish the visualization to be.

Once all of this is prepared, you can start up your http server and run VoroTree within your exisiting webpage.

## Further Options ##

You can further customize your VoroTree visualization with the following options in your HTMLElement:

* **data-staticFontSize** {true} or {false} ==> adjusts font size to the size of the voronoi cell if set to true.
* **data-weightAttribute** \<string\> ==> name of the weight attribute you wish to use (in case it is not 'weight').
* **data-color** {aquamarine} or {rainbow} or {grayscale} ==> adjusts color scheme to your preference.

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
