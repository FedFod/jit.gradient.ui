function Pointer(x, color, ID)
{
	this.pos = [x, gGradientSize[1]];
	this.pointerColor = color;
	this.selectionColor = black;
    this.color = color.slice();
	this.ID = ID;
	this.percentageText = null;

    this.percentage = x/JSUISize[0];

	this.Reposition = function()
	{
		var newPos = JSUISize[0] * this.percentage;
		this.Move(newPos);
	}

    this.Move = function(x)
	{
		this.pos[0] = x;
        this.percentage = this.pos[0]/JSUISize[0];
	}

	this.UpdatePos = function()
	{
		this.pos[0] = this.pos[0];
		this.pos[1] = gGradientSize[1];
	}

	this.SetPointerColor = function()
	{
		this.pointerColor = this.color;
	}

	this.CheckIfSelected = function(x)
	{
		if (Math.abs(this.pos[0]-x) <= gPointersSize[0])
		{	
			this.SetPointerColor();
			return this.ID;
		} 
		else 
		{	
			return -1;
		}
	}

	this.Draw = function(mg)
	{
		mg.set_source_rgba(this.pointerColor);
		mg.rectangle(this.pos[0],this.pos[1], gPointersSize[0], gPointersSize[1]);
		mg.fill();
		if (gPointerSelected == this.ID)
		{
			mg.set_source_rgba(this.selectionColor);
			mg.rectangle(this.pos[0],this.pos[1], gPointersSize[0], gPointersSize[1]);
			mg.stroke();
		}
		this.DrawPercentageText(mg);
	}

	this.DrawPercentageText = function(mg)
	{	
		if (gPointerSelected == this.ID)
		{
			mg.set_font_size(12);
			mg.set_source_rgba(black);
			var tempPercentage = this.percentage*100;
			var percentString = "position: "+tempPercentage.toFixed(2)+"%";
			var tm = mg.text_measure(percentString);
			mg.move_to(picker.GetPosition()[0]+picker.GetSize()[0]+picker.GetTextMeasure()[0]+JSUISize[0]/7, gGradientSize[1]+gPointersSize[1]+picker.GetSize()[1]/2+tm[1]/2);
	
			mg.text_path(percentString);
			mg.fill();
		}
	}

    this.GetColor = function()
    {
        return this.color;
    }
	
	this.SetColor = function(color)
	{	
		if (Array.isArray(color))
		{
			this.color = color.slice();
			this.SetPointerColor();
		}
	}
    
    this.GetPercentage = function()
    {
        return this.percentage;
    }

	this.GetID = function()
	{
		return this.ID;
	}
}

//---------------------------------------

function CreateFirstPointers()
{	
	pointers = {};
	pointers[gPointersID] = (new Pointer(0, [1,0,0,1], gPointersID));
	var newID = ++gPointersID;
    pointers[newID] = (new Pointer(JSUISize[0]-gPointersSize[0], [0,1,0,1], newID));
}

function AddPointer(x)
{	
	var newID = ++gPointersID;
	gPointerSelected = newID;
	pointers[newID] = (new Pointer(x, red, newID));
	pointers[newID].SetPointerColor();
	picker.SetColor(pointers[gPointerSelected].GetColor());
	DrawAll();
	print("added pointer")
}
AddPointer.local = 1;

function DrawPointers()
{	
	for (var pointer in pointers)
	{	
		pointers[pointer].UpdatePos();
		pointers[pointer].Draw(mgOutput);
	}
}
DrawPointers.local = 1;

function CheckIfPointersSelected()
{	
	if (!picker.isSelected)
	{	
		gPointerSelected = -1;
		for (var pointer in pointers)
		{
			var tempIndex = pointers[pointer].CheckIfSelected(mousePos[0]);
			if (tempIndex != -1)
			{	
				gPointerSelected = tempIndex;
				picker.SetColor(pointers[gPointerSelected].GetColor());
			}
		}
	}
}
CheckIfPointersSelected.local = 1;


function CheckIfPointersExist()
{
	return ((Object.keys(pointers).length != 0));
}
CheckIfPointersExist.local = 1;

function MovePointer()
{		
	if (CheckIfPointersExist() && (gPointerSelected!=-1) && !picker.isSelected)
	{
		pointers[gPointerSelected].Move(mousePos[0]);
	}
}
MovePointer.local = 1;

function DeselectPointer()
{
	gPointerSelected = -1;
	DrawAll();
}

function DeleteSelectedPointer()
{	
	var shiftDown = max.shiftkeydown;
	if (gPointerSelected!=-1 && CheckIfPointersExist() && shiftDown)
	{
		delete pointers[gPointerSelected];
		gPointerSelected = -1;
		DrawAll();
	}
}
DeleteSelectedPointer.local = 1;

function GetSmallestPercentagePointer()
{	
	var perc = 2.0;
	var smallestPercID = -1;
	for (var pointer in pointers)
	{	
		var pointerPerc = pointers[pointer].GetPercentage();
		if (pointerPerc < perc)
		{
			smallestPercID = pointers[pointer].GetID();
			perc = pointerPerc;
		}
	}
	return smallestPercID;
}
GetSmallestPercentagePointer.local = 1;

function RepositionPointers()
{
	for (var pointer in pointers)
	{	
		pointers[pointer].Reposition();
	}
}
RepositionPointers.local = 1;

