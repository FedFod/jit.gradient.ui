autowatch = 1;
outlets = 1;
include("JSUIGradient_Pointer.js");
include("JSUIGradient_Picker.js");


mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

box.rect = [box.rect[0], box.rect[1],box.rect[0]+480, box.rect[1]+85];

var JSUISize = [box.rect[2] - box.rect[0], box.rect[3] - box.rect[1]];
var gGradientSize = null;
var gPointersSize = null;
var gPreviousMovePointerPerc = -1;
var gPreviousMovePointerIndex = -1;
var gSortedIndices = [];
SetSizes();

var mgOutput = new MGraphics(JSUISize[0], JSUISize[1]);
var mgOutputGradient = new MGraphics(JSUISize[0], 1);
mgOutputGradient.relative_coords = 0;
mgOutputGradient.autofill = 0;

var outImage = null;
var displayImage = null;
var mousePos = [-100, -100];
var black = [0,0,0,1];
var white = [1,1,1,1];
var red = [1,0,0,1];
var gBgColor = [0.6, 0.6, 0.6, 1];
var gPointerBackgroundColor =  [0.9,0.9,0.9,1];
var isInit = false;

var pointers = {};
var gPointerSelected = -1;
var gPointersID = 0;

var outputMatrix = new JitterMatrix(4, "float32", [200, 1]);
outputMatrix.adapt = 0;
var oneDimOutMatrix = new JitterMatrix(4, "float32", [200, 1]);
oneDimOutMatrix.adapt = 0;

var p = this.patcher; 
var picker = new Picker();

var g_bgImage = new Image("imageBG.png");
// var g_bgImgMatrix = new JitterMatrix();
// g_bgImgMatrix.importmovie("imageBG.png");

// var g_jit_alphablend = new JitterObject("jit.alphablend");

// PUBLIC FUNCTIONS ----------------------

function bang()
{	
	DrawAll();
	OutputGradMatrix();
}

function move_pointer(index, percentage)
{
	if ((index < Object.keys(pointers).length) && index >= 0 && (gPreviousMovePointerPerc != percentage))
	{	
		if (gPreviousMovePointerIndex != index)
		{
			gSortedIndices = GetSortedPointersIndices();
			gPreviousMovePointerIndex = index;
		}
		picker.DeselectPicker();
		SelectPointer(gSortedIndices[index][0]);
		picker.SetColor(pointers[gPointerSelected].GetColor());
		var newPos = percentage * JSUISize[0];
		MovePointer(newPos);
		DrawAll();
		gPreviousMovePointerPerc = percentage;
	}
}

function pointer_color(index, r, g, b, a)
{
	var sortedIndices = GetSortedPointersIndices();
	picker.DeselectPicker();
	SelectPointer(sortedIndices[index][0]);
	var color = [r,g,b,a];
	if (a)
	{
		color[3] = a;
	}
	pointers[gPointerSelected].SetColor(color);
	picker.SetColor(color);
	DrawAll();
}

function clear()
{	
	var index = GetSmallestPercentagePointer();

	for (var pointer in pointers)
	{	
		if (pointers[pointer].GetID() != index)
		{
			delete pointers[pointer];
		}
	}
	
	gPointerSelected = -1;
	gc();
	DrawAll();
}

function alpha_last(val)
{
	if (val)
	{
		oneDimOutMatrix.planemap = [1, 2, 3, 0];
	} 
	else 
	{
		oneDimOutMatrix.planemap = [0, 1, 2, 3];
	}
	OutputGradMatrix();
}

function output_matrix_dim(newDim)
{
	outputMatrix.dim = [newDim, 1];
	oneDimOutMatrix.dim = [newDim, 1];
	OutputGradMatrix();
}

// PRIVATE FUNCTIONS ----------------------

function Init()
{		
	CreateFirstPointers();
	picker.CreatePickerMaxObj();
	DrawAll();
}
Init.local = 1;

function loadbang()
{	
	p.apply(RemoveOldPickersIter);
}

function RemoveOldPickersIter(b)
{
	if (b.maxclass == "colorpicker")
	{	
		print("picker found "+b.varname)
		var pickerIsInside = picker.CheckIfPickerObjIsInsideJSUI(b);

		var isCalledPicker = (b.varname.indexOf(("++picker++")) != -1);

		if ((isCalledPicker && pickerIsInside))
		{
			p.remove(b);
			print("----------------removed")
		}
	}
}

function SetSizes()
{
	gGradientSize = [JSUISize[0], JSUISize[1]/1.7];
	gPointersSize = [JSUISize[0]/60, JSUISize[1]/6];
}
SetSizes.local = 1;

function onclick(x,y, button)
{	
	SetMousePos(x, y);
	picker.OpenPicker(); 
	CheckIfPointersSelected();
	DeleteSelectedPointer();
}
onclick.local = 1; 

function ondblclick(x,y, button)
{	
	SetMousePos(x, y);
	if (mousePos[1] <= (gGradientSize[1]+gPointersSize[1]))
	{
		AddPointer(x);
		DrawAll();
	}
}
ondblclick.local = 1;

function onresize(width, height)
{	
	JSUISize = [width, height]; 
	SetSizes();
	RepositionPointers();
	picker.SetPickerSize();
	picker.SetPickerPosition();
	picker.SetMaxObjPosition();
	picker.MovePicker();
	mgOutput = new MGraphics(width, height);
	DrawAll();
}
onresize.local = 1;

function ondrag(x,y) // must be called "ondrag"
{	
	SetMousePos(x, y);
	MovePointer(mousePos[0]);	
	DrawAll();
}
ondrag.local = 1; 


function SetMousePos(x, y)
{
	var width = JSUISize[0];
	var height = JSUISize[1];

	x = Math.min(Math.max(0, x), width-gPointersSize[0]);
	y = Math.min(Math.max(0, y), height);

	mousePos[0] = x; 
	mousePos[1] = y;
}
SetMousePos.local = 1;

function OutputGradMatrix()
{	
	outImage = new Image(mgOutputGradient);
	outImage.tonamedmatrix(outputMatrix.name);
		
	oneDimOutMatrix.frommatrix(outputMatrix.name);
	outlet(0, "jit_matrix", oneDimOutMatrix.name);
}
OutputGradMatrix.local = 1;

// DRAWING FUNCTIONS ------------
function paint() {
	if (mgraphics && displayImage)
	{	
		mgraphics.image_surface_draw(displayImage);	
	}
	if (!isInit)
	{
		Init();
		isInit = true;
	}
	picker.SetMaxObjPosition();
	picker.SendMaxObjToBack();
	gc();
	
}
paint.local = 1;

function ClearBackground()
{
	mgOutput.set_source_rgba(gPointerBackgroundColor);
	mgOutput.rectangle(0,gGradientSize[1], gGradientSize[0], gPointersSize[1]);
	mgOutput.fill();
	// Draw edge
	mgOutput.set_source_rgba(black);
	mgOutput.rectangle(0,gGradientSize[1], gGradientSize[0], gPointersSize[1]);
	mgOutput.stroke();

	mgOutputGradient.set_source_rgba([0,0,0,1]);
	mgOutputGradient.rectangle(0, 1, gGradientSize[0], 1);
	mgOutputGradient.fill();
}
ClearBackground.local = 1;

function DrawAll()
{	
	DrawBackground();
	picker.DrawPicker();
	DrawGradient();
	DrawPointers();
	DrawToDisplayImage();
}
DrawAll.local = 1;

function DrawTransparencyBG()
{	
	var currentWidth = 0;
	while (currentWidth<JSUISize[0]+g_bgImage.size[0])
	{	
		mgOutput.translate(currentWidth,0);
		mgOutput.image_surface_draw(g_bgImage);
		currentWidth += g_bgImage.size[0];
		mgOutput.identity_matrix();
	}
}

function DrawGradient()
{	
	// mgOutput.set_source_rgba(gPointerBackgroundColor);

	mgOutput.rectangle(0,0,gGradientSize[0], gGradientSize[1]);
	// mgOutputGradient.set_source_rgba(0.99,0,0.99,0.5);
	mgOutputGradient.rectangle(0,0,gGradientSize[0], 1);
	// mgOutputGradient.fill();

	var gradPattr = mgOutput.pattern_create_linear(0, gGradientSize[1], gGradientSize[0], gGradientSize[1]);
	var gradPattr2 = mgOutputGradient.pattern_create_linear(0, 1, gGradientSize[0], 1);

	var smallestPercPointerID = GetSmallestPercentagePointer();

	// this must be done to avoid glitch on first pointer color
	gradPattr.add_color_stop_rgba(0., pointers[smallestPercPointerID].GetColor());
	gradPattr2.add_color_stop_rgba(0., pointers[smallestPercPointerID].GetColor());
	print(pointers[smallestPercPointerID].GetColor())

	for (var pointer in pointers) {
		var percentage = Math.max(pointers[pointer].GetPercentage(), 0.001);
		gradPattr.add_color_stop_rgba(percentage, pointers[pointer].GetColor());
		gradPattr2.add_color_stop_rgba(percentage, pointers[pointer].GetColor());
	}
	
	mgOutput.set_source(gradPattr);
	mgOutput.fill();

	mgOutputGradient.set_source(gradPattr);
	mgOutputGradient.fill();

	OutputGradMatrix();
	ClearBackground();
}
DrawGradient.local = 1;

function DrawBackground()
{	
	DrawTransparencyBG();
	mgOutput.set_source_rgba(gBgColor);
	mgOutput.rectangle(0,gGradientSize[1]+gPointersSize[1], gGradientSize[0], JSUISize[1]-gGradientSize[1]+gPointersSize[1]);
	mgOutput.fill();
}
DrawBackground.local = 1;

function DrawToDisplayImage()
{	
	displayImage = new Image(mgOutput);
	mgraphics.redraw();
}
DrawToDisplayImage.local = 1;

//----------------------------------------------
// FREE MEMORY
function notifydeleted()
{	
	outputMatrix.freepeer();
	oneDimOutMatrix.freepeer();
	// g_bgImgMatrix.freepeer();
	// g_jit_alphablend.freepeer();
	mgOutput.freepeer();
	mgraphics.freepeer();
	mgOutputGradient.freepeer();
	picker.DestroyPickerMaxObj();
	p.write();
	gc();
}
notifydeleted.local = 1;

function print() {
	for (var i = 0; i < arguments.length; i++) {
   		post(arguments[i]);
  	}
	post();
}
print.local = 1;

// SAVE / LOAD
// function setvalueof(dict)
// {
// 	var percentages = dict.get("pointers_percentages");
// 	print(percentages);
// }

// function getvalueof()
// {	
// 	print("get value of")
// 	var saveDict = new Dict();
// 	var percentages = [];
// 	for (var pointer in pointers)
// 	{
// 		percentages.push(pointers[pointer].GetPercentage());
// 	}
// 	saveDict.replace("pointers_percentages", percentages);
// 	return saveDict;
// }



