

function write(path) {
	debug(DEBUG.GENERAL, "saving to " + path);
	saveDictToPath(path);
}

function read(path) {
	debug(DEBUG.GENERAL, "loading to " + path);
	loadSaveDict(path);
}

function getvalueof() {
	debug(DEBUG.GENERAL, "getvalueof");
	return buildSaveDict(null);
}

function setvalueof(dict) {
	debug(DEBUG.GENERAL, "setvalueof");
	loadFromDict(dict);
}



function buildSaveDict() {
	var saveDict = new Dict();

	saveDict.replace("meshdim", meshdim);
	saveDict.replace("nurbs_order", nurbs_order);
	saveDict.replace("layer", layer);
	saveDict.replace("lock_to_aspect", lock_to_aspect);
	//saveDict.replace("blend_enable", blend_enable);
	saveDict.replace("color", color);	
	saveDict.replace("grid_color", grid_color);
	saveDict.replace("show_ui", show_ui);
	saveDict.replace("point_size", point_size);
	saveDict.replace("grid_size", grid_size);

	saveDict.replace("windowRatio", gWindowRatio);
	
	gMesh.saveDataIntoDict(saveDict);
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
	meshdim = saveDict.get("meshdim");
	nurbs_order = saveDict.get("nurbs_order");
	layer = saveDict.get("layer");
	lock_to_aspect = saveDict.get("lock_to_aspect");
	//blend_enable = saveDict.get("blend_enable");
	color = saveDict.get("color");	
	grid_color = saveDict.get("grid_color");
	show_ui = saveDict.get("show_ui");
	point_size = saveDict.get("point_size");
	grid_size = saveDict.get("grid_size");

	gWindowRatio = saveDict.get("windowRatio");

	gMesh.loadDict(saveDict); 
	// gMesh.changeMode(mode);
	setTexturesMeshes();
}
loadFromDict.local = 1;

function setScaleRelativeToAspect(val) {
	lock_to_aspect = val;
	gMesh.scaleToTextureRatio(val);
}
setScaleRelativeToAspect.local = 1;

function setTexturesMeshes() {
	if (arguments.length > 0) {
		texture = (arrayfromargs(arguments));
	}
	gMesh.assignTextureToMesh(texture);
	//gMesh.initAndAssignTextureCoordMat(); // in case there are more than one textures, update the coordinates to put a texture in every mesh
}
setTexturesMeshes.local = 1;

function setScale(scaleX, scaleY) {
	gMesh.scaleMesh(scaleX, scaleY);
	gMesh.setLatestScale_calcBoundsMat();
}
setScale.local = 1;

function getScale() {
	return gMesh.currentScale.slice();
}
getScale.local = 1;

function setPosition(posX, posY) {
	gMesh.setMeshPosition([posX, posY]);
	gMesh.updateGUI();
	gMesh.calcMeshBoundsMat();
}
setPosition.local = 1;

function getPosition() {
	return gMesh.currentPos.slice();
}
getPosition.local = 1;

function setMeshLayer(val) {
	layer = val;
	setVideoplaneLayer(val);
}
setMeshLayer.local = 1;

function setVideoplaneLayer(val) {
	videoplane.layer = val;
}
setVideoplaneLayer.local = 1;

function setNurbsOrMeshMode(arg) {
	if (arg == 0 || arg == 1) {
		use_nurbs = arg;
		gMesh.setNurbsOrMeshMode(use_nurbs);
	}
}
setNurbsOrMeshMode.local = 1;

function setNurbsOrder(x, y) {
	nurbs_order[0] = Math.min(Math.max(x, 1), gMesh.posMatDim[0] - 1);
	nurbs_order[1] = Math.min(Math.max(y, 1), gMesh.posMatDim[1] - 1);
	gMesh.changeNurbsOrder(nurbs_order[0], nurbs_order[1]);
}
setNurbsOrder.local = 1;

function setCurvature(curve) {
	curvature = Math.min(Math.max(curve, 0.), 0.9999);
	orderx = Math.floor(curvature * gMesh.posMatDim[0]);
	ordery = Math.floor(curvature * gMesh.posMatDim[1]);
	if(nurbs_order[0] != orderx || nurbs_order[1] != ordery) {
		setNurbsOrder(orderx, ordery);
	}
}
setCurvature.local = 1;

function setMeshDim(meshSizeX, meshSizeY) {
	var xSize = Math.max(meshSizeX, 2);
	var ySize = Math.max(meshSizeY, 2);
	meshdim = [xSize, ySize];
	if (gMesh!=null) {
		gMesh.resizeMeshDim([xSize, ySize]);
	}
}
setMeshDim.local = 1;

function showUI(show) {
	show_ui = show;
	if (gMesh!=null && show) {
		assignThisAsCurrentlySelectedToGlobal();
	}
	else if (!show) {
		deselectThisFromGlobal();
		gGraphics.resetSingleCircle();
		gGraphics.resetSelected();
	}
}
showUI.local = 1;

function show_position_handle(val) {
	gMesh.showMoveHandle(val);
}

function show_scale_handles(val) {
	gMesh.showScaleHandles(val);
}

function setPointSize(size) {
	point_size = size;
	gMesh.meshPoints.point_size = point_size;
}
setPointSize.local = 1;

function setGridSize(size) {
	grid_size = size;
	gMesh.meshGrid.line_width = grid_size;
	gMesh.meshGrid.enable = (gMesh.showMeshUI && grid_size > 0);
}
setGridSize.local = 1;