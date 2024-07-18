#include "emscripten.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>


#include "examples/example_util.h"
#include "imageio/image_dec.h"
#include "imageio/webpdec.h"
#include "src/webp/encode.h"
#include "src/webp/mux.h"


WebPAnimEncoder* enc = NULL;
WebPAnimEncoderOptions anim_config;
WebPConfig config;
WebPPicture pic;
WebPData webp_data;

int timestamp_ms = 0;
int result[2];

EMSCRIPTEN_KEEPALIVE
uint8_t* createBuffer(size_t size) {
  return (uint8_t*)WebPMalloc(size + 1);
}

EMSCRIPTEN_KEEPALIVE
int addFrame(uint8_t* data, size_t data_size, int duration) {
  WebPImageReader reader;
  int ok;

  pic.use_argb = 1;
  // reader = WebPGuessImageReader(data, data_size);
  // ok = reader(data, data_size, &pic, 1, NULL);
  ok = ReadWebP(data, data_size, &pic, 1, NULL);
  WebPFree((void*)data);

  if (!ok) {
    fprintf(stderr, "Could not read data.\n");
  }

  if (enc == NULL) {
    enc = WebPAnimEncoderNew(pic.width, pic.height, &anim_config);
    ok = (enc != NULL);
    if (!ok) {
      fprintf(stderr, "Could not create WebPAnimEncoder object.\n");
    }
  }

  if (ok) {
    ok = WebPAnimEncoderAdd(enc, &pic, timestamp_ms, &config);
    if (!ok) {
      fprintf(stderr, "Error while adding frame\n");
    }
  }

  // END: 
    WebPPictureFree(&pic);
    timestamp_ms += duration;
    return ok;
}

EMSCRIPTEN_KEEPALIVE
int generate(){
  int ok;
  ok = WebPAnimEncoderAdd(enc, NULL, timestamp_ms, NULL);
  ok = WebPAnimEncoderAssemble(enc, &webp_data);
  if (!ok) {
    fprintf(stderr, "Error during final animation assembly.\n");
  }
  result[0] = (int)webp_data.bytes;
  result[1] = webp_data.size;
  WebPAnimEncoderDelete(enc);
  enc = NULL;
  return ok;
}

EMSCRIPTEN_KEEPALIVE
int getResultPointer() {
  return result[0];
}

EMSCRIPTEN_KEEPALIVE
int getResultSize() {
  return result[1];
}

EMSCRIPTEN_KEEPALIVE
void freeResult() {
  WebPDataClear(&webp_data);
}

EMSCRIPTEN_KEEPALIVE
void init(int lossless, float quality, int method) {
  WebPDataInit(&webp_data);

  if (!WebPAnimEncoderOptionsInit(&anim_config) ||
      !WebPConfigInit(&config) ||
      !WebPPictureInit(&pic)) {
    fprintf(stderr, "Library version mismatch!\n");
  }

  config.lossless = lossless;
  config.quality = quality;
  config.method = method;
}
