function extToImagePath(ext) {
    var res = '../imgs/icons16/page.png';

    if(ext == "html" || ext == "htm" || ext == "xhml") {
        res = '../imgs/icons16/html.png';
    } else 
    if(ext == "png") {
        res = '../imgs/icons16/png.png';
    } else 
    if(ext == "gif") {
        res = '../imgs/icons16/gif.png';
    } else 
    if(ext == "jpeg" || ext == "jpg") {
        res = '../imgs/icons16/jpg.png';
    } else 
    if(ext == "m4a" || ext == "mp4" || ext == "mpg" || ext == "mpeg") {
        res = '../imgs/icons16/mpeg.png';
    } else  
    if(ext == "mp3") {
        res = '../imgs/icons16/mp3.png';
    } else 
    if(ext == "txt" || ext == "yml" || ext == "yaml") {
        res = '../imgs/icons16/document.png';
    } else 
    if(ext == "js" || ext == "ts") {
        res = '../imgs/icons16/js.png';
    } else 
    if(ext == "json") {
        res = '../imgs/icons16/json.png';
    } else 
    if(ext == "css") {
        res = '../imgs/icons16/css.png';
    } else 
    if(ext == "md") {
        res = '../imgs/icons16/markdown.png';
    } else 
    if(ext == "license") {
        res = '../imgs/icons16/license.png';
    } else 
    if(ext == "wav") {
        res = '../imgs/icons16/wav.png';
    } else 
    if(ext == "m4a") {
        res = '../imgs/icons16/mpeg.png';
    } else 
    if(ext == "exe") {
        res = '../imgs/icons16/exe.png';
    } else 
    if(ext == "ttf") {
        res = '../imgs/icons16/ttf.png';
    } else 
    if(ext == "doc" || ext == "docx") {
        res = '../imgs/icons16/word.png';
    } else 
    if(ext == "ogg") {
        res = '../imgs/icons16/ogg.png';
    } else 
    if(ext == "php") {
        res = '../imgs/icons16/php.png';
    } else
    if(ext == "rar") {
        res = '../imgs/icons16/rar.png';
    } else
    if(ext == "7z") {
        res = '../imgs/icons16/7z.png';
    } else
    if(ext == "zip" || ext == "tar" || ext == "wim" || ext == "z") {
        res = '../imgs/icons16/archive.png';
    } else
    if(ext == "xls" || ext == "xlsx" || ext == "xlr") {
        res = '../imgs/icons16/xls.png';
    } else
    if(ext == "ppt" || ext == "pptx" || ext == "pps") {
        res = '../imgs/icons16/ppt.png';
    } else
    if(ext == "bmp" || ext == "ico" || ext == "tga" || ext == "pdn") {
        res = '../imgs/icons16/image.png';
    } else
    if(ext == "iso" || ext == "vcd") {
        res = '../imgs/icons16/cd.png';
    } else
    if(ext == "db" || ext == "dat" || ext == "sql") {
        res = '../imgs/icons16/database.png';
    } else
    if(ext == "dmg") {
        res = '../imgs/icons16/dmg.png';
    } else
    if(ext == "csv") {
        res = '../imgs/icons16/csv.png';
    } else
    if(ext == "asp") {
        res = '../imgs/icons16/asp.png';
    } else
    if(ext == "apk") {
        res = '../imgs/icons16/apk.png';
    } else
    if(ext == "cpp") {
        res = '../imgs/icons16/cpp.png';
    } else
    if(ext == "cs") {
        res = '../imgs/icons16/cs.png';
    } else
    if(ext == "py") {
        res = '../imgs/icons16/py.png';
    } else
    if(ext == "otf") {
        res = '../imgs/icons16/otf.png';
    } else
    if(ext == "tif" || ext == "tiff") {
        res = '../imgs/icons16/tif.png';
    } else
    if(ext == "psd") {
        res = '../imgs/icons16/psd.png';
    } else
    if(ext == "svg") {
        res = '../imgs/icons16/vector.png';
    } else
    if(ext == "jsp") {
        res = '../imgs/icons16/jsp.png';
    } else
    if(ext == "rss") {
        res = '../imgs/icons16/rss.png';
    } else
    if(ext == "swift") {
        res = '../imgs/icons16/swift.png';
    } else
    if(ext == "vb") {
        res = '../imgs/icons16/vb.png';
    } else
    if(ext == "avi") {
        res = '../imgs/icons16/avi.png';
    } else
    if(ext == "dll") {
        res = '../imgs/icons16/dll.png';
    } else
    if(ext == "pdf") {
        res = '../imgs/icons16/pdf.png';
    } else
    if(ext == "flv" || ext == "swf") {
        res = '../imgs/icons16/flv.png';
    } else
    if(ext == "c") {
        res = '../imgs/icons16/c.png';
    } else
    if(ext == "gitignore") {
        res = '../imgs/icons16/git-fork.png';
    } else
    if(ext == "shtml" || ext == "stm" || ext == "shtm") {
        res = '../imgs/icons16/server.png';
    } else
    if(ext == "mov") {
        res = '../imgs/icons16/mov.png';
    }
    
    return res;
}

module.exports = extToImagePath;