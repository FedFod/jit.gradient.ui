function KeyObj()
{
    this.keyMaxObj = null;
    this.intMaxObj = null;

    this.CreateKey = function()
    {
        if (this.keyMaxObj == null)
        {
            this.keyMaxObj = p.newdefault(box.rect[0], box.rect[1]+JSUISize[1]/3, "key");
            this.intMaxObj = p.newdefault(box.rect[0], box.rect[1]+JSUISize[1]/3, "number");
        }
        if (this.keyMaxObj)
        {   
            p.hiddenconnect(this.keyMaxObj, 0, this.intMaxObj, 0);
            this.keyMaxObj.hidden = 1;
            this.keyMaxObj.varname = "++key++"+Math.floor(Math.random()*100000);
            this.intMaxObj.ignoreclick = 1;
            this.intMaxObj.hidden = 1;
            this.intMaxObj.varname = "++key_int++"+Math.floor(Math.random()*100000);
            this.keyListener = new MaxobjListener(this.intMaxObj, KeyCallback);
        }
    }

    this.SetMaxObjPosition = function()
    {   
        if (this.keyMaxObj)
        {
            p.script("sendbox",this.keyMaxObj.varname,"patching_rect", [box.rect[0], box.rect[1]+JSUISize[1]/3, 50, 10]);
            p.script("sendbox",this.intMaxObj.varname,"patching_rect", [box.rect[0], box.rect[1]+JSUISize[1]/3, 50, 10]);
        }
    }

    this.DestroyMaxObj = function()
    {
        p.remove(this.keyMaxObj);
        p.remove(this.intMaxObj);
    }

    this.CheckIfKeyObjIsInsideJSUI = function(keyObj)
    {   
        if (keyObj.rect[0] >= box.rect[0] && keyObj.rect[2] <= box.rect[2] &&
            keyObj.rect[1] >= box.rect[1] && keyObj.rect[3] <= box.rect[3])
        {   
            return 1;
        }
        else 
        {
            return 0;
        }
    }
}

function KeyCallback(data)
{
    if (data.value == 127 || data.value == 8)
    {
        DeleteSelectedPointer();
    }
}