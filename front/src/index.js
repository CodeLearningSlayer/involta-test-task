import EditorJS from "@editorjs/editorjs"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import Embed from "@editorjs/embed"
import ImageTool from '@editorjs/image';
import SimpleImage from "@editorjs/simple-image";
import "./css/style.scss";
import notifier from "codex-notifier";
import {ConfirmNotifierOptions, NotifierOptions, PromptNotifierOptions} from 'codex-notifier';

const getNumOfBlock = (elem) => {
    let findedIndex = -1;
    Array.from(document.querySelector(".codex-editor__redactor").children).forEach((item, index) => {
        if (item.isEqualNode(elem)){
            findedIndex = index;
        }
    })
    return findedIndex;
}

class Pinner {
    constructor(api){
        this._pinned = {}
        this._api = api;
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


    hidePopovers() {
        try {
            const popoverItems = Array.from(document.querySelector(".ce-popover--opened .ce-popover__items")?.children);
            const cleanPopovers = ['move-up', 'delete', 'move-down'];
            popoverItems.forEach((item) => {
                if (cleanPopovers.includes(item.getAttribute("data-item-name"))){
                    item.style.display = "none";
                }
            });
        } catch (e){}
        
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
        let lastFocused;
        const target = document.querySelector(".codex-editor__redactor");
        const observer = new MutationObserver((mutations) => {
            let findedBlock;
            mutations.forEach((mutationRecord) =>{
                if (mutationRecord.target.classList.contains("ce-block--selected")){
                    findedBlock = mutationRecord.target;
                }
            });
            lastFocused = getNumOfBlock(findedBlock) !== -1 ? getNumOfBlock(findedBlock) : lastFocused;
            if (lastFocused <= blockToPin.getLastIndexOfPinnedBlocks()){
                blockToPin.hidePopovers()
            }
          });
  
          observer.observe(target, {
            subtree: true,
            childList: true,
            attributeFilter: ['class'],
            attributes: true
          });
        // blockToPin.hidePopovers();
        blockToPin.getPinnedBlocks(); // так достучимся до проверки
        // blockToPin.hideTunesBlock();
    })
    .catch(error => {
        console.log(error);
    }) 

