import {createSettings} from "./createSettings";
import {SearchSettings} from "@qommand/common/src/settings/search.settings.types";

export const searchSettings = createSettings<SearchSettings>({
    name: 'search',
    defaultSettings: {
        version: 1,
        searchWeights: {},
        searchHistory: {},
    },
});