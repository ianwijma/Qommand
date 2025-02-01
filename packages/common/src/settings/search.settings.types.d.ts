import {BaseSettings} from "../settings.types";

type SearchIdentifier = string;
type SearchWeights = { [key: SearchIdentifier]: number };

type SearchHistoryItem = number; // Unix Date
type SearchHistory = { [key: SearchIdentifier]: SearchHistoryItem[] };

export type SearchSettings = BaseSettings & {
    searchWeights: SearchWeights,
    searchHistory: SearchHistory,
};