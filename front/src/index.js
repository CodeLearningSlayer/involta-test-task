import EditorJS from "@editorjs/editorjs"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import Embed from "@editorjs/embed"
import ImageTool from '@editorjs/image';
import SimpleImage from "@editorjs/simple-image";
import "./css/style.scss";
import notifier from "codex-notifier";
import {ConfirmNotifierOptions, NotifierOptions, PromptNotifierOptions} from 'codex-notifier';

class Pinner {
    constructor(api){
        this._pinned = {}
        this._api = api;
        console.log(this.allBlocks);
    }

    getBlock() {
        return this._block
    }

    getPinnedBlocks() {
        this._api.configuration.data.blocks.forEach((block, index) => {
            if (block.data.fixed === true){
                this._pinned[index] = this._api.blocks.getBlockByIndex(index);
            }
        })
    }

    updateAllBlocks() {
        this.allBlocks = this.getAllBlocks();
    }

    getAllBlocks(){
        return Array.from(document.querySelectorAll(".ce-block"));
    }

    hideTunesBlock() {
        const toolbar = document.querySelector(".ce-toolbar");        
        this.updateAllBlocks();
        document.querySelector(".codex-editor__redactor").addEventListener("mouseover", (e) => {
            let flag = false;
            this.allBlocks.forEach((item, index) => {
                const isToolboxOpened = document.querySelector(".codex-editor--toolbox-opened") ?? false;
                const isSelection = document.querySelector(".ce-block--selected") ?? false;
                const isOnlyFixedBlocks = this.getLastIndexOfPinnedBlocks() + 1 == this.allBlocks.length
                if (e.composedPath().indexOf(item) != -1 && index in Object.keys(this._pinned) && !isSelection && !isToolboxOpened || isOnlyFixedBlocks){
                    flag = true;
                }
            if (flag == true)
                toolbar.classList.add("hidden");
            else toolbar.classList.remove("hidden");
        })
        }, true)
    }

    logApi(){
        console.log(this._api)
    }
    
    getLastIndexOfPinnedBlocks(){
        return Number(Object.keys(this._pinned).slice(-1));
    }

    getConfig () {
        return this._block.config
    }
}

let blockToPin;

const editor = new EditorJS({
    holder: "editorjs",
    autofocus: true,
    tools: {
        imageT: {
            class: ImageTool,
            config : {
                endpoints: {
                    byFile: 'http://localhost:3010/uploadFile',
                    byUrl: 'http://localhost:3010/fetchUrl'
                },
                field: "selectedImage"
            },
        },
        list: {
            class: List,
            inlineToolbar: ['link']
        },
        header: {
            class: Header,
            inlineToolbar: ['link', 'bold']
        },
        embed: {
            class: Embed,
            inlineToolbar: false,
            config: {
                services: {
                    youtube: true
                }
            }
        },
        image:{
            class: SimpleImage
        }
    },
    hideToolbar:true,
    data: {
        time: 1552744582955,
        blocks: [
            {
                type: "paragraph",
                data: {
                    text: "Моё тестовое задание",
                    fixed: true
                },
            },
            {
                type: "image",
                data: {
                  url: "https://picsum.photos/500",
                  fixed: true
                },
            },
        ],
        version: "2.11.10" 
    },
    onChange: (api, event) => {
        const lastIndexOfPinnedBlocks = blockToPin.getLastIndexOfPinnedBlocks()
        switch(event.type){
            case 'block-added':
                if (event.detail.index <= lastIndexOfPinnedBlocks){
                    notifier.show({
                        message:"Нельзя добавлять блоки выше закрепленных",
                        style: "error" 
                    })
                    api.blocks.delete(event.detail.index);
                }
                else blockToPin.updateAllBlocks();
                break;
            
            case 'block-moved':
                if (event.detail.toIndex == lastIndexOfPinnedBlocks){
                    notifier.show({
                        message:"Нельзя менять местами с закрепленными блоками",
                        style: "error" 
                    });
                    api.blocks.move(lastIndexOfPinnedBlocks + 1);
                }
                break;
        } 
        console.log(event.type);
    }
});
let saveBtn = document.querySelector(".save-button");
saveBtn.addEventListener('click', function(){
    editor.save().then((output) => {
        console.log('Data: ', output);
    }).catch((err) => {
        console.log(err.message);
    })
})

blockToPin = new Pinner(editor);

editor.isReady
    .then(() => {
        blockToPin.getPinnedBlocks(); // так достучимся до проверки
        blockToPin.hideTunesBlock();
    })
    .catch(error => {
        console.log(error);
    }) 

// fetch("http://localhost:3010/").then().then(res => console.log(res.text));