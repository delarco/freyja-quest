import { Color } from "../models/color";
import { Size } from "../models/size";
import { Texture } from "../models/texture";

export class TextureUtils {

    public static serialize(texture: Texture): Uint8Array {

        // 30 bytes: name
        // 1 byte: width
        // 1 byte: height
        // N bytes: data * 4 (pixel RGBA)
        const size = 30 + 1 + 1 + (texture.size.width * texture.size.height * 4);
        const data = new Uint8Array(size);

        for(let i = 0; i < texture.name.length; i++) data[i] = texture.name.charCodeAt(i);

        data[30] = texture.size.width;
        data[31] = texture.size.height;

        let offset = 32;

        for(let color of texture.data) {

            data[offset + 0] = color.r;
            data[offset + 1] = color.g;
            data[offset + 2] = color.b;
            data[offset + 3] = color.a;
            offset += 4;
        }
        
        return data;
    }

    public static deserialize(data: Uint8Array): Texture {

        // 30 bytes: name
        // 1 byte: width
        // 1 byte: height
        // N bytes: data * 4 (pixel RGBA)

        let name = '';
        let width = 0;
        let height = 0;
        let arrayColors = new Array<Color>();

        for(let i = 0; i < 30; i++) {
            
            if(data[i] == 0) break;
            name += String.fromCharCode(data[i]);
        }

        width = data[30];
        height = data[31];

        const size = 30 + 1 + 1 + (width * height * 4);

        for(let index = 32; index < size; index += 4) {

            const color = new Color(
                data[index + 0],
                data[index + 1],
                data[index + 2],
                data[index + 3]
            );

            arrayColors.push(color);
        }

        return new Texture(name, new Size(width, height), arrayColors);
    }
}
