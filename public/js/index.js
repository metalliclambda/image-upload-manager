var file = document.getElementById('file-input');
var fileLastModified  = document.getElementById('fileLastModified');
var imgPreview  = document.getElementById('imgPreview');
var imgNaturalWidth  = document.getElementById('imgNaturalWidth');
var imgNaturalHeigth  = document.getElementById('imgNaturalHeigth');
var notImageTag  = document.getElementById('not-image-alert');

document.getElementById('submitButton').disabled = true;

function inputChange(){
    notImageTag.hidden = false;     
    document.getElementById('submitButton').disabled = true;
    let reg = [/.jpg$/,/.png$/,/.jpeg$/,/.gif$/];
    let fileIsOK=false;
    for(let i=0 ; i<reg.length; i++){
        if(reg[i].test(file.value)){
            fileIsOK = true;
            break;
        }
    }

    if(!fileIsOK){
        document.getElementById('submitButton').disabled = true;
        imgPreview.hidden = true;  
        notImageTag.hidden = false;     
        
    } else {
        fileLastModified.value = file.files[0].lastModifiedDate;
        imgPreview.src = URL.createObjectURL(file.files[0]);
        imgPreview.hidden = false;
        imgNaturalWidth.value = imgPreview.imgNaturalWidth;        
    }
}

imgPreview.onload = function(event){
    document.getElementById('submitButton').disabled = false;
    notImageTag.hidden = true;
    imgNaturalWidth.value = imgPreview.naturalWidth;
    imgNaturalHeigth.value = imgPreview.naturalHeight;
    console.log(imgPreview.naturalWidth , imgPreview.naturalHeight);    
}