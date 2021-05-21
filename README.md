# The user manual

## Importing the corpus
To proceed into the application you'll have to use a valid corpus. 
What counts as a valid corpus is explained in the documentation on the page 
[Interfaces/Corpus](https://www.fi.muni.cz/~xpetr2/document-maps/documentation/interfaces/Corpus.html).

To import a corpus, you can click the ***Insert corpus as file*** button and proceed to select your 
corpus JSON, or you can enter the corpus as a pasted text by clicking on the ***Insert corpus as JSON text***.

If you just wish to explore the tool, an example corpus is provided upon clicking the ***Use the example corpus***.

## Navigating the map
To navigate the map you can simply click and drag the map around and scroll up to zoom in or scroll down to zoom out.

If you wish to move the map around without a mouse, you can do so using arrow keys and the *'+'* and *'-'* keys to
zoom in and out respectively.

You can also use the on screen user interface to center or zoom the camera.

![Camera control UI](https://raw.githubusercontent.com/xpetr2/document-maps/master/src/assets/camera_controls.jpg "The camera controls")

## Selecting nodes
To select a node you can simply click on it. This will by default colour in all the other nodes depending on their
deviation from the calculated cosine distance. You can refer to the deviation legend that appears.

![Deviation error indicator](https://raw.githubusercontent.com/xpetr2/document-maps/master/src/assets/deviation_error.jpg "The deviation error indicator")

This legend displays an indicator whenever you hover over a node as portrayed in the image above.

If you desire to highlight multiple nodes, you can do so by holding the *CTRL* key

## Viewing the document content
When selecting a document, you can view its contents on the right side of the screen. If you wish to view 
multiple documents' contents at once, you can do so by selecting multiple nodes and then exploring them on
the right side as well.

## Comparing documents
To compare documents, you need to select exactly two documents and then click the *Compare* button in the top right.

![Compare button](https://raw.githubusercontent.com/xpetr2/document-maps/master/src/assets/compare_button.jpg "The compare button")

This then opens the comparison screen, where you can compare the documents in further detail

### Selecting words
If you click on a checkbox next to one of the matched words, you will select that word for highlighting in the documents
displayed above.

![Word selection](https://raw.githubusercontent.com/xpetr2/document-maps/master/src/assets/word_selection.jpg "The word selection")

If you select the words from the exact matches column, the highlights will be coloured in yellow, and if you select
a match from the soft match column, the first word will be coloured in with yellow as well but the second will be
coloured red.

You can further single out highlights by hovering over the word in the word selections columns.

## Changing settings
You can change the settings of the tool by pressing the settings button in the top left.

![Settings menu](https://raw.githubusercontent.com/xpetr2/document-maps/master/src/assets/settings_menu.jpg "Settings menu")

# Licence
MIT License

Copyright (c) 2021 Michal Petr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
