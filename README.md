# Phaser Tiled JSON External Loader

`phaser-tiled-json-external-loader` is a Phaser loader that loads [Tiled][] tilemaps exported as JSON. Unlike the built-in loader, external tilemaps are supported.

[Tiled]: https://www.mapeditor.org/

## Prerequisites

- Phaser 3.16.3 or higher (I think? I haven't tested much.)
- Tiled 1.1.5 or higher (Again, this isn't terribly well-tested.)

## Tileset Format

Only JSON-formatted tilesets are supported. TMX and other formats are not supported. Make sure to export your tilesets from Tiled as JSON files.

## Relative Tileset Paths

Tilesets paths are saved by Tiled as relative to the tilemap file, and it's assumed that they are similarly relative to each other on your web server.

What this means is that your webpage should serve the tilemap and tileset files at the same paths relative to each other as when you're editing them. For example, let's say your tilemap is at `/foo/tilemap.json` and uses a tileset at `/foo/bar/tileset.json`. If your tilemap is loaded on the server at `http://example.com/tilemap.json`, then the tileset must be served at `http://example.com/bar/tileset.json`.

## Installation and Setup

### Via Webpack

1. Install the library:

   ```sh
   npm install --save phaser-tiled-json-external-loader
   ```
2. Import and register the loader before initializing your game:

   ```js
   import registerTiledJSONExternalLoader from 'phaser-tiled-json-external-loader';
   registerTiledJSONExternalLoader(Phaser);
   ```

### Via Bundled JS File

1. Download the JS bundle from the [Releases][] tab.
2. Load the JS bundle in your HTML file:

   ```html
   <script src="phaser-tiled-json-external-loader.js"></script>
   ```

## Usage

Use the `tilemapTiledJSONExternal` loader to load your tilemap's JSON:

```js
this.load.tilemapTiledJSONExternal('tilemap', 'tilemap.json');
```

Assuming the paths are set up correctly as described above, you should see your tilemap JSON as well as the tilesets being loaded in the network tab on your browser's devtools.

## License & Copyright

Originally adapted from the Phaser built-in MutliAtlasFile loader. `phaser-tiled-json-external-loader` is licensed under the MIT license. See `LICENSE` for more info.
