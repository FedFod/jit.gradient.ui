function Picker()
{
    this.maxObj = null;
    this.pickerListener = null;
    this.offsetFromPointers = 3;
    this.pickerPos = [JSUISize[0]/30, gGradientSize[1]+JSUISize[1]/6+this.offsetFromPointers];
    this.pickerSize = [JSUISize[0]/10, JSUISize[1]-this.pickerPos[1]-2];
    this.pickerColor = [0,0,1,1];
    this.isSelected = false;
    this.textMeasure = 0.0;


    this.GetColor = function()
    {   
        if (this.maxObj)
        {
            var pickedColor = (this.maxObj.getattr("currentcolor"));
            return pickedColor;
        } 
        else 
        {   
            FF_Utils.Print("NO COLOR")
            return -1;
        }
    }

    this.GetPosition = function()
    {
        return this.pickerPos;
    }

    this.GetSize = function()
    {   
        return this.pickerSize;
    }

    this.SetColor = function(color)
    {   
        this.pickerColor = color.slice();
        // var tempColor = color.slice();
        // tempColor[3] = 1;
        this.maxObj.message("currentcolor", color.slice());
        // print("color "+color.slice())
    }

    this.SetColorToPointer = function()
    {
        if (gPointerSelected!=-1 && CheckIfPointersExist())
        {   
            pointers[gPointerSelected].SetColor(this.pickerColor);
        }
        DrawAll();
    }
    
    this.PickerExists = function()
    {   
       return this.maxObj != null;
    }

    this.CreatePickerMaxObj = function()
    {   
        this.maxObj = p.getnamed("++picker++");
        
        if (this.maxObj == null)
        {
            this.maxObj = p.newdefault(box.rect[0], box.rect[1]+JSUISize[1]/3, "colorpicker");
        }
        // print("Created Picker ++++++++++++++++++");
        
        if (this.maxObj)
        {
            this.maxObj.hidden = 1;
            this.maxObj.ignoreclick = 1;
            this.maxObj.varname = "++picker++";//+Math.floor(Math.random()*100000);
            this.maxObj.compatibility = 0;
            this.pickerListener = new MaxobjListener(this.maxObj, "currentcolor", PickerCallback);
            this.SetMaxObjPosition();
        }
    }

    this.SendMaxObjToBack = function()
    {
        p.sendtoback(this.maxObj);
    }

    this.SetMaxObjPosition = function()
    {   
        if (this.maxObj)
        {   
            p.script("sendbox",this.maxObj.varname,"patching_rect", [box.rect[0], box.rect[1]+JSUISize[1]/3, 100, 10]);
        }
    }

    this.CheckIfPickerObjIsInsideJSUI = function(pickerObj)
    {   
        if (pickerObj.rect[0] >= box.rect[0] && pickerObj.rect[2] <= box.rect[2] &&
            pickerObj.rect[1] >= box.rect[1] && pickerObj.rect[3] <= box.rect[3])
        {   
            // print("isINSIDE")
            return 1;
        }
        else 
        {
            return 0;
        }
    }

    this.SetPickerSize = function()
    {
        this.pickerSize = [JSUISize[0]/10, JSUISize[1]-this.pickerPos[1]-2];
    }

    this.SetPickerPosition = function()
    {
        this.pickerPos = [JSUISize[0]/30, gGradientSize[1]+JSUISize[1]/6+this.offsetFromPointers];
    }

    this.DrawPicker = function()
    {   
        mgOutput.set_source_rgba(gBgColor);
        if (gPointerSelected != -1)
	    {	
            var tempColor = this.pickerColor.slice();
            tempColor[3] = 1;
            mgOutput.set_source_rgba(tempColor);
        } 
        mgOutput.rectangle(this.pickerPos[0], this.pickerPos[1], this.pickerSize[0], this.pickerSize[1]);
        mgOutput.fill();
        mgOutput.set_source_rgba(black);
        mgOutput.rectangle(this.pickerPos[0], this.pickerPos[1], this.pickerSize[0], this.pickerSize[1]);
        mgOutput.stroke();
        this.DrawColorText();
    }

    this.DrawColorText = function()
	{	
        mgOutput.set_font_size(12);
        mgOutput.set_source_rgba(black);
        var colorString = "R:"+this.pickerColor[0].toFixed(2) + " G:"+this.pickerColor[1].toFixed(2)+ " B:"+this.pickerColor[2].toFixed(2)+ " A:"+this.pickerColor[3].toFixed(2);
        this.textMeasure = mgOutput.text_measure(colorString);
        mgOutput.move_to(picker.GetPosition()[0]+picker.GetSize()[0]+10, gGradientSize[1]+gPointersSize[1]+picker.GetSize()[1]/2+this.textMeasure[1]/2);
        mgOutput.text_path(colorString);
        mgOutput.fill();
	}

    this.GetTextMeasure = function()
    {
        return this.textMeasure;
    }

    this.MovePicker = function()
    {
        this.pickerPos[0] = JSUISize[0]/10;
        this.pickerPos[1] = gGradientSize[1]+(JSUISize[1]/6)+this.offsetFromPointers;
    }

    this.OpenPicker = function()
    {
        if (this.CheckIfPickerIsSelected() && this.PickerExists())
        {   
            this.maxObj.message("bang");
        }
    }

    this.CheckIfPickerIsSelected = function()
    {   
        this.isSelected = false;
        if ((mousePos[0] > this.pickerPos[0]) && (mousePos[0]<(this.pickerPos[0]+this.pickerSize[0])) && 
        (mousePos[1] > this.pickerPos[1]) && (mousePos[1]<(this.pickerPos[1]+this.pickerSize[1])) &&
        gPointerSelected != -1)
        {
            this.isSelected = true;
        }
        return this.isSelected;
    }

    this.DeselectPicker = function()
    {
        this.isSelected = false;
    }

    this.DestroyPickerMaxObj = function()
    {
        p.remove(this.maxObj);
        this.maxObj = null;
    }
}
//-------------------------

function PickerCallback(data)
{   
    if (picker.isSelected)
    {
        var pickedColor = picker.GetColor();
        picker.SetColor(pickedColor);
        picker.SetColorToPointer();
    }
}

