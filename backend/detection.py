import base64
import io
import logging

import PIL.Image
import PIL.ImageDraw
import torch
import uvicorn
from cached_path import cached_path
from fastapi import FastAPI, File, UploadFile, responses
from fastapi.middleware.cors import CORSMiddleware
from transformers import DetrForObjectDetection, DetrImageProcessor

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)


def decode_base64_image(base64_str: str):
    try:
        image = base64.b64decode(base64_str)
    except Exception as e:
        logger.error("Failed to decode base64 string: %s" % e)
        raise e
    return image


def object_detection(image: PIL.Image) -> PIL.Image:
    model_path = cached_path("hf://facebook/detr-resnet-50")
    processor = DetrImageProcessor(
        size={"shortest_edge": 300, "longest_edge": 1333}
    ).from_pretrained(model_path)
    model = DetrForObjectDetection.from_pretrained(model_path)
    inputs = processor(image, return_tensors="pt")
    outputs = model(**inputs)
    target_sizes = torch.tensor([image.size[::-1]])
    results = processor.post_process_object_detection(
        outputs, target_sizes=target_sizes, threshold=0.9
    )[0]

    for score, label, box in zip(
        results["scores"], results["labels"], results["boxes"]
    ):
        box = [round(i, 2) for i in box.tolist()]
        object_name = model.config.id2label[label.item()]
        # make image with bbox
        draw = PIL.ImageDraw.Draw(image)
        draw.rectangle(box, outline="red")
        draw.text((box[0] + 5, box[1] + 5), f"{object_name} {score:.2f}", fill="red")

    return image


class Api(FastAPI):
    def __init__(self):
        super().__init__()
        self.post("/object_detection")(self.object_detection)
        self.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # アクセスを許可するオリジンを指定
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    async def object_detection(self, image: UploadFile = File(...)):
        try:
            contents = await image.read()
            image = PIL.Image.open(io.BytesIO(contents)).convert("RGB")
            print(image.size)
            image = object_detection(image)
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG")
            return responses.StreamingResponse(
                io.BytesIO(buffered.getvalue()),
                media_type="image/jpeg",
            )
        except Exception as e:
            logger.error("Failed to object detection: %s" % e)
            raise e


if __name__ == "__main__":
    uvicorn.run(Api(), host="127.0.0.1", port=8001)
