/**
 * @author     Richard Davey <rich@photonstorm.com>, Michael Kelly <me@mkelly.me>
 * @copyright  2019 Photon Storm Ltd.
 * @license    {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */

export default function registerTiledJSONExternalLoader(Phaser) {
  const FileTypesManager = Phaser.Loader.FileTypesManager;
  const GetFastValue = Phaser.Utils.Objects.GetFastValue;
  const IsPlainObject = Phaser.Utils.Objects.IsPlainObject;
  const JSONFile = Phaser.Loader.FileTypes.JSONFile;
  const MultiFile = Phaser.Loader.MultiFile;

  class TiledJSONExternalFile extends MultiFile {
    constructor(loader, key, tilemapURL, path, baseURL, tilemapXhrSettings, tilesetXhrSettings) {
      if (IsPlainObject(key)) {
        const config = key;

        key = GetFastValue(config, 'key');
        tilemapURL = GetFastValue(config, 'url');
        tilemapXhrSettings = GetFastValue(config, 'xhrSettings');
        path = GetFastValue(config, 'path');
        baseURL = GetFastValue(config, 'baseURL');
        tilesetXhrSettings = GetFastValue(config, 'tilesetXhrSettings');
      }

      const tilemapFile = new JSONFile(loader, key, tilemapURL, tilemapXhrSettings);
      super(loader, 'tilemapJSON', key, [tilemapFile]);

      this.config.path = path;
      this.config.baseURL = baseURL;
      this.config.tilesetXhrSettings = tilesetXhrSettings;
    }

    onFileComplete(file) {
      const index = this.files.indexOf(file);
      if (index !== -1) {
        this.pending--;

        if (file.type === 'json' && file.data.hasOwnProperty('tilesets')) {
          //  Inspect the data for the files to now load
          const tilesets = file.data.tilesets;

          const config = this.config;
          const loader = this.loader;

          const currentBaseURL = loader.baseURL;
          const currentPath = loader.path;
          const currentPrefix = loader.prefix;

          const baseURL = GetFastValue(config, 'baseURL', currentBaseURL);
          const path = GetFastValue(config, 'path', currentPath);
          const prefix = GetFastValue(config, 'prefix', currentPrefix);
          const tilesetXhrSettings = GetFastValue(config, 'tilesetXhrSettings');

          loader.setBaseURL(baseURL);
          loader.setPath(path);
          loader.setPrefix(prefix);

          for (const [index, tileset] of tilesets.entries()) {
            if (!tileset.source) {
              continue;
            }

            // Tileset is relative to the tilemap filename, so we abuse URL to
            // get the relative path.
            const url = new URL(file.src, 'http://example.com');
            url.pathname += `/../${tileset.source}`;
            const tilesetUrl = url.pathname.slice(1);

            const tilesetFile = new JSONFile(
              loader,
              `_TILESET_${file.key}_${tilesetUrl}`,
              tilesetUrl,
              tilesetXhrSettings,
            );
            tilesetFile.tilesetIndex = index;
            this.addToMultiFile(tilesetFile);
            loader.addFile(tilesetFile);
          }

          //  Reset the loader settings
          loader.setBaseURL(currentBaseURL);
          loader.setPath(currentPath);
          loader.setPrefix(currentPrefix);
        }
      }
    }

    addToCache() {
      if (this.isReadyToProcess()) {
        const tilemapFile = this.files[0];
        for (const file of this.files.slice(1)) {
          const index = file.tilesetIndex;
          tilemapFile.data.tilesets[index] = {
            ...tilemapFile.data.tilesets[index],
            ...file.data,
            source: undefined, // Avoid throwing in tilemap creator
          };
        }

        this.loader.cacheManager.tilemap.add(tilemapFile.key, {
          format: Phaser.Tilemaps.Formats.TILED_JSON,
          data: tilemapFile.data,
        });

        this.complete = true;

        for (const file of this.files) {
          file.pendingDestroy();
        }
      }
    }

  }

  FileTypesManager.register(
    'tilemapTiledJSONExternal',
    function (key, tilemapURL, path, baseURL, tilemapXhrSettings) {

      //  Supports an Object file definition in the key argument
      //  Or an array of objects in the key argument
      //  Or a single entry where all arguments have been defined

      if (Array.isArray(key)) {
        for (var i = 0; i < key.length; i++) {
          const multifile = new TiledJSONExternalFile(this, key[i]);
          this.addFile(multifile.files);
        }
      } else {
        const multifile = new TiledJSONExternalFile(this, key, tilemapURL, path, baseURL, tilemapXhrSettings);
        this.addFile(multifile.files);
      }

      return this;
    },
  );
}
