import EditorJS from "@editorjs/editorjs"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import Embed from "@editorjs/embed"
import ImageTool from '@editorjs/image';
import SimpleImage from "@editorjs/simple-image";
import "./css/style.scss";

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
    data: {
        time: 1552744582955,
        blocks: [
            {
                type: "paragraph",
                data: {
                    text: "Моё тестовое задание"
                }
            },
            {
                type: "image",
                data: {
                  url: "https://picsum.photos/600"
                }
            }
        ],
        version: "2.11.10" 
    },
});
let saveBtn = document.querySelector(".save-button");
saveBtn.addEventListener('click', function(){
    editor.save().then((output) => {
        console.log('Data: ', output);
    }).catch((err) => {
        console.log(err.message);
    })
})

fetch("http://localhost:3010/").then().then(res => console.log(res.text));