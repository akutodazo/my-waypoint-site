const DEFAULT_CAMERA = {
  sensorWidth:  17.3,
  sensorHeight: 13.0,
  focalLength:  24,
};

function computeSpacing(params, camera) {
  const Wg = (camera.sensorWidth  / camera.focalLength) * params.height;
  const Hg = (camera.sensorHeight / camera.focalLength) * params.height;
  return {
    lineSpacing:  Wg * (1 - params.side),   // 隣の飛行線との距離(m)
    photoSpacing: Hg * (1 - params.front),  // 1本の線上で写真を撮る間隔(m)
  };
}