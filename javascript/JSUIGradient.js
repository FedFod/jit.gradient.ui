autowatch = 1;
outlets = 1;
include("JSUIGradient_Pointer.js");
include("JSUIGradient_Picker.js");


mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var JSUISize = [box.rect[2] - box.rect[0], box.rect[3] - box.rect[1]];
var gGradientSize = null;
var gPointersSize = null;
SetSizes();

var mgOutput = new MGraphics(JSUISize[0], JSUISize[1]);

var outImage = null;
var displayImage = null;
var mousePos = [-100, -100];
var black = [0,0,0,1];
var white = [1,1,1,1];
var red = [1,0,0,1];
var gBgColor = [0.6, 0.6, 0.6, 1];
var gPointerBackgroundColor =  [0.9,0.9,0.9,1];
var isInit = false;

var colors = [];
var pointers = {};
var gPointerSelected = -1;
var gPointersID = 0;

var outputMatrix = new JitterMatrix(4, "float32", [200, 1]);
outputMatrix.adapt = 0;
var oneDimOutMatrix = new JitterMatrix(4, "float32", [200, 1]);
oneDimOutMatrix.adapt = 0;

var p = this.patcher; 
var picker = new Picker();

// PUBLIC FUNCTIONS ----------------------

function bang()
{	
	DrawAll();
	OutputGradMatrix();
}

function clear()
{
	for (var pointer in pointers)
	{
		if (pointer>0)
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
		oneDimOutMatrix.planemap = [0,1, 2, 3];
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
	MovePointer();	
	DrawAll();
}
ondrag.local = 1; 

function DrawAll()
{	
	DrawBackground();
	picker.DrawPicker();
	DrawGradient();
	DrawPointers();
	DrawToDisplayImage();
}
DrawAll.local = 1;

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

function ClearBackground()
{
	mgOutput.set_source_rgba(gPointerBackgroundColor);
	mgOutput.rectangle(0,gGradientSize[1], gGradientSize[0], gPointersSize[1]);
	mgOutput.fill();
	mgOutput.set_source_rgba(black);
	mgOutput.rectangle(0,gGradientSize[1], gGradientSize[0], gPointersSize[1]);
	mgOutput.stroke();
}
ClearBackground.local = 1;

function DrawGradient()
{	
	mgOutput.rectangle(0,0,gGradientSize[0], gGradientSize[1]);

	var gradPattr = mgOutput.pattern_create_linear(0, gGradientSize[1], gGradientSize[0], gGradientSize[1]);

	var smallestPercPointerID = GetSmallestPercentagePointer();
	gradPattr.add_color_stop_rgba(0., pointers[smallestPercPointerID].GetColor());

	for (var pointer in pointers) {
		var percentage = Math.max(pointers[pointer].GetPercentage(), 0.001);
		gradPattr.add_color_stop_rgba(percentage, pointers[pointer].GetColor());
	}
	
	mgOutput.set_source(gradPattr);
	mgOutput.fill();

	OutputGradMatrix();
	ClearBackground();
}
DrawGradient.local = 1;

function DrawBackground()
{
	mgOutput.set_source_rgba(gBgColor);
	mgOutput.rectangle(0,gGradientSize[1]+gPointersSize[1], gGradientSize[0], JSUISize[1]-gGradientSize[1]+gPointersSize[1]);
	mgOutput.fill();
}

function OutputGradMatrix()
{	
	outImage = new Image(mgOutput);
	outImage.tonamedmatrix(outputMatrix.name);
		
	oneDimOutMatrix.frommatrix(outputMatrix.name);
	outlet(0, "jit_matrix", oneDimOutMatrix.name);
}
OutputGradMatrix.local = 1;

function DrawToDisplayImage()
{	
	displayImage = new Image(mgOutput);
	mgraphics.redraw();
}
DrawToDisplayImage.local = 1;

function notifydeleted()
{	
	outputMatrix.freepeer();
	oneDimOutMatrix.freepeer();
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





