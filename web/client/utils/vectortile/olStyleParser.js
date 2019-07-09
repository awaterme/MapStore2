

const { get, head, isEqual } = require('lodash');
const { getStyle } = require('../../components/map/openlayers/VectorStyle');

const {
    Reader: sldReader,
    OlStyler: sldOlStyler,
    getGeometryStyles: sldGetGeometryStyles,
    getLayerNames: sldGetLayerNames,
    getLayer: sldGetLayer,
    getRules: sldGetRules
} = require('@nieuwlandgeo/sldreader/src/index');

const SLDParser = require('geostyler-sld-parser').default;
const OpenLayersParser = require('geostyler-openlayers-parser').default;

const sldParser = new SLDParser();
const olParser = new OpenLayersParser();

let ICONS = {};

const loadImages = (srcs, callback = () => { }) => {
    let srcCount = srcs.length;
    if (srcCount === 0) callback();
    srcs.forEach(src => {
        if (ICONS[src]) {
            srcCount--;
            if (srcCount === 0) callback();
        } else {
            const img = new Image();
            img.onload = () => {
                const maxSide = img.naturalWidth > img.naturalHeight ? img.naturalWidth : img.naturalHeight;
                ICONS[src] = {
                    src,
                    img,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    maxSide
                };
                srcCount--;
                if (srcCount === 0) callback();
            };
            img.onerror = () => {
                srcCount--;
                if (srcCount === 0) callback();
            };
            img.src = src;
        }
    });
};

const setStroke = ({ stroke, ...symbol }) => {
    const css = get(stroke, 'css') || { stroke: 'rgba(0, 0, 0, 0)' };
    return { ...symbol, stroke: { css: { stroke: '#000000', ...css } } };
};

module.exports = {
    mapstore: ({ styleBody }, options, olLayer) => {
        if (olLayer) olLayer.setStyle(getStyle(options));
    },
    sld: ({ styleBody }, options, olLayer) => {
        if (!styleBody) return null;
        sldParser.readStyle(styleBody)
            .then(parsedStyle =>
                olParser
                    .writeStyle(parsedStyle)
                    .then(olStyle => olLayer.setStyle(olStyle))
                    .catch(error => console.log(error))
            )
            .catch(error => console.log(error));
        /*const styledLayerDescriptor = sldReader(styleBody);

        const layerNames = sldGetLayerNames(styledLayerDescriptor);
        const defaultLayerName = head(layerNames.filter(name => name.toLowerCase().indexOf('default') !== -1)) || layerNames.length === 1 && layerNames[0];
        const Z_INDEX_STEP_LAYER = 5000;
        const zIndexLayers = layerNames.reduce((indexes, name, idx) => ({ ...indexes, [name]: idx * Z_INDEX_STEP_LAYER }), {});

        const iconsSRCs = (styledLayerDescriptor && styledLayerDescriptor.layers || [])
            .reduce((layers, layer) =>
                [...layers, ...(layer.styles || [])
                    .reduce((styles, style) =>
                        [...styles, ...(style.featuretypestyles || [])
                            .reduce((featuretypestyles, featuretype) =>
                                [...featuretypestyles, ...(featuretype.rules || [])
                                    .filter(rule => get(rule, 'pointsymbolizer.graphic.externalgraphic.onlineresource'))
                                    .map(rule => get(rule, 'pointsymbolizer.graphic.externalgraphic.onlineresource'))],
                                [])],
                        [])],
                []);
        loadImages(iconsSRCs, () => {
            const styleFunction = (olFeature, resolution) => {

                const geometry = olFeature.getGeometry();
                const geometryType = geometry.getType();
                const properties = olFeature.getProperties();
                const layerName = properties.layer && (layerNames || []).indexOf(properties.layer) !== -1 ? properties.layer : defaultLayerName;
                const layer = sldGetLayer(styledLayerDescriptor, layerName);

                if (!layer) return null;

                const olFeaturedTypeStyles = (layer.styles || [])
                    .reduce((newStyles, style) => ([...newStyles, ...(style.featuretypestyles || [])]), [])
                    .map(featuretypestyle => {
                        const filteredRules = sldGetRules(featuretypestyle, { geometry, properties }, resolution);
                        const geomStyle = sldGetGeometryStyles(filteredRules);
                        const polygon = geomStyle.polygon.map(pol => setStroke(pol));
                        const line = geomStyle.line.map(lin => setStroke(lin));
                        return {
                            olStyles: sldOlStyler(
                                { ...geomStyle, polygon, line },
                                geometryType,
                                properties,
                                ICONS
                            ),
                            zIndexes: filteredRules
                                .map(filteredRule => head(featuretypestyle.rules.map((rule, idx) => isEqual(rule, filteredRule) ? idx : null)
                                    .filter(val => val !== null)))
                        };
                    });

                const Z_INDEX_STEP_FTS = Z_INDEX_STEP_LAYER / olFeaturedTypeStyles.length;

                return olFeaturedTypeStyles.reduce((plainOlStyles, { olStyles, zIndexes }, idx) => {
                    return [
                        ...plainOlStyles,
                        ...olStyles.map((olStyle ) => {
                            const zIndex = (zIndexLayers[layerName] || 0) + Z_INDEX_STEP_FTS * idx; /* - zIndexes[jdx];
                            olStyle.setZIndex(zIndex);
                            return olStyle;
                        })
                    ];
                }, []);
            };

            if (olLayer) olLayer.setStyle(styleFunction);
        });*/
    }
};