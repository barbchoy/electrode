"use strict";

const Fs = require("fs");
const _ = require("lodash");
const optionalRequire = require("optional-require")(require);
const Path = require("path");
const archetype = require("electrode-archetype-react-app/config/archetype");
const AppMode = archetype.AppMode;
const chalk = require("chalk");
const logger = require("electrode-archetype-react-app/lib/logger");
const mkdirp = require("mkdirp");

const DEV_HMR_DIR = ".__dev_hmr";

function makeEntryPartial() {
  const partial = {
    context: Path.resolve(AppMode.src.client)
  };

  //
  // Look for src/client/entry.config.js, which should export the entry field
  // for the webpack config.  It can be an object that specifies multiple
  // entries, or a string that points the file for entry
  //
  function searchEntryConfig() {
    /*
     * Allow an application to opt in for *multiple* entry points and consequently for
     * multiple bundles in the app by placing `bundle.config.js` in application root
     * directory.
     *
     * If you need to set something like __webpack_public_path__, then your entry file
     * must be vanilla JS because webpack can only process those, so support having a
     * vanilla JS file as entry.
     */
    const entryPath = Path.join(partial.context, "entry.config.js");

    const entry = optionalRequire(entryPath, {
      fail: err => {
        logger.error(`Loading ${entryPath} failed`, err);
        process.exit(1);
      },
      notFound: () => logger.info(`No custom entry point configuration ${entryPath}`)
    });

    if (entry) {
      logger.info(`Using custom entry config from ${entryPath}`);
    }

    return entry;
  }

  function genSubAppHmrEntry(hmrDir, isDev, manifest) {
    let subAppReq = `${manifest.subAppDir}/${manifest.entry}`;
    // subapp has built-in code to handle HMR accept
    // or not running in webpack dev mode
    // => do not generate HMR accept code
    if (manifest.hmrSelfAccept || !isDev) {
      return `./${subAppReq}`;
    }

    const hmrEntry = `hmr-${manifest.subAppDir}.js`;
    subAppReq = `../${subAppReq}`;

    Fs.writeFileSync(
      Path.join(hmrDir, hmrEntry),
      `"use strict";
require("${subAppReq}");
if (module.hot) {
  module.hot.accept("${subAppReq}", () => {
    require("subapp-web").hotReloadSubApp(require("${subAppReq}"));
  });
}
`
    );
    return `./${DEV_HMR_DIR}/${hmrEntry}`;
  }

  //
  // Look for src/client/<name>/subapp.js files.  If found, then assume app follows
  // the subapp architecture, and automatically generate one entry for each subapp.
  //
  function searchSubApps() {
    const subApps = AppMode.subApps;

    if (_.isEmpty(subApps)) {
      logger.info(`No subapps found under ${AppMode.src.dir}`);
      return false;
    } else {
      logger.info(`Found subapps: ${Object.keys(subApps).join(", ")}`);
    }

    const isDev = Boolean(process.env.WEBPACK_DEV);
    const hmrDir = Path.resolve(AppMode.src.dir, DEV_HMR_DIR);
    const gitIgnoreFile = Path.join(hmrDir, ".gitignore");
    if (isDev && !Fs.existsSync(gitIgnoreFile)) {
      mkdirp.sync(hmrDir);
      Fs.writeFileSync(
        gitIgnoreFile,
        `# Directory to contain Electrode default hot module loaders for subapps
# Please ignore this
# Please don't commit this
*
`
      );
    }
    partial.context = Path.resolve(AppMode.src.dir);
    const entry = {};
    _.each(subApps, ma => {
      const entryName = `${ma.name.toLowerCase()}`;
      const x1 = `${chalk.magenta("subapp")} ${chalk.blue(ma.name)}`;
      entry[entryName] = genSubAppHmrEntry(hmrDir, isDev, ma);
      logger.info(`${x1} entry ${entry[entryName]}`);
    });

    return entry;
  }

  function appEntry() {
    // App has src/client/entry.config.js?
    const entryConfig = searchEntryConfig();
    if (entryConfig) return entryConfig;

    if (archetype.options.subapp !== false) {
      // App has subapp apps within src?
      const subApps = searchSubApps();
      if (subApps) {
        return subApps;
      }
    } else {
      logger.info(`subapp turned off by archetypeConfig.options.subapp flag`);
    }

    // finally look for src/client/app.js or src/client/app.jsx or src/client/app.tsx
    const entries = ["./app.js", "./app.jsx", "./app.tsx"];
    const entry = entries.find(f => Fs.existsSync(Path.join(partial.context, f))) || "./app.jsx";
    logger.info(
      `Default to single app entry point using ${entry} under context ${partial.context}`
    );

    return entry;
  }

  function shouldPolyfill() {
    if (archetype.webpack.enableBabelPolyfill) {
      const hasMultipleTarget =
        Object.keys(archetype.babel.envTargets)
          .sort()
          .join(",") !== "default,node";
      if (hasMultipleTarget) {
        return archetype.babel.target === "default";
        // for all other targets, disable polyfill
      } else {
        return true;
      }
    }

    return false;
  }

  function makeEntry() {
    let entry = appEntry();
    const polyfill = shouldPolyfill();

    if (polyfill) {
      const coreJs = "core-js";
      const runtime = "regenerator-runtime/runtime";
      if (_.isArray(entry)) {
        entry = { main: [coreJs, runtime, ...entry] };
      } else if (_.isObject(entry)) {
        entry = Object.entries(entry).reduce((prev, [k, v]) => {
          prev[k] = [coreJs, runtime].concat(v);
          return prev;
        }, {});
      } else {
        entry = { main: [coreJs, runtime, entry] };
      }
    }

    return entry;
  }

  partial.entry = makeEntry();

  return partial;
}

module.exports = makeEntryPartial();
