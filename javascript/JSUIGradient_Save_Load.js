

function write(path) {
	saveDictToPath(path);
}

function read(path) {
	loadSaveDict(path);
}

function getvalueof() {
	return buildSaveDict(null);
}

function setvalueof(dict) {
	loadFromDict(dict);
}

function buildSaveDict() {
	var saveDict = new Dict();

	var percentages = [];
	for (var pointer in pointers)
	{
		percentages.push(pointers[pointer].GetPercentage());
	}
	saveDict.replace("pointers_percentages", percentages);	
	return saveDict;
}
buildSaveDict.local = 1;

function saveDictToPath(path) {
	var saveDict = buildSaveDict();
	saveDict.export_json(path);
}
saveDictToPath.local = 1;

function loadSaveDict(path) {
	var saveDict = new Dict();
	saveDict.import_json(path);
	
	loadFromDict(saveDict);
}
loadSaveDict.local = 1;

function loadFromDict(saveDict) {
	var percentages = saveDict.get("pointers_percentages");
	// print("Percentage: ")
	percentages.forEach(print);
}
loadFromDict.local = 1;

