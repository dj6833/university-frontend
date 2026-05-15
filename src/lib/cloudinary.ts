import { Cloudinary } from "@cloudinary/url-gen";
import {fill} from "@cloudinary/url-gen/actions/resize";
import { compass } from "@cloudinary/url-gen/qualifiers/gravity";

import { TextStyle } from "@cloudinary/url-gen/qualifiers/textStyle";
import { format, quality, dpr } from "@cloudinary/url-gen/actions/delivery";
import {source} from "@cloudinary/url-gen/actions/overlay";
import {text} from "@cloudinary/url-gen/qualifiers/source";
import {Position} from "@cloudinary/url-gen/qualifiers/position";

import { CLOUDINARY_CLOUD_NAME } from "@/constants";
import {solid} from "@cloudinary/url-gen/actions/border";

// Cloudinary instance.
const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
});

export const bannerPhoto = (imageCldPubId: string, name: string) => {
    return (
        cld
            .image(imageCldPubId)

            .resize(
                fill().width(1200).height(297) // Aspect ratio 5:1
            )
            // Optimize for web
            .delivery(format("auto"))
            .delivery(quality("auto"))
            .delivery(dpr("auto"))
            // Text overlay with name
            .overlay(
                source(
                    text(name, new TextStyle("roboto", 54).fontWeight("bold"))
                        .textColor(
                            //could these colours be referenced by their css classes elsewhere in the project?
                            //"#3d3929"
                            "#c96442"
                        )
                        .backgroundColor("#fcf8f9")
                        //.border(solid(40, "brown")) //'.border' property is mentioned in cloudinary docs but this syntax not working
                ).position(
                    new Position()
                        .gravity(compass("north_west"))
                        .offsetY(0.2)
                        .offsetX(0.02)
                )
            )
    );
};
