![](http://g.recordit.co/bX66Kn9cxa.gif)

# ENVISION 

A developer tool for visualizing a React application's component hierarchy.

## Usage

Install globally for usage anywhere on your system.

    $ npm install -g envision-jsx
  
Once installed, cd into the directory that contains your source file, and pass in the path to the root component you want to begin with (Typically where your ReactDOM.render call is). Envision will generate a tree diagram visualizing your application's React JSX component hierarchy.

    $ envision <root-file>
  
## Prerequisites

For now... envision will only understand your *unbundled* source code and assumes you are using JSX. 
