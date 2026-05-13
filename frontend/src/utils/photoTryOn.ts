export type Point = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type Rect = Point & Size

export type BodyKeypointName =
  | 'neck'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'waistLeft'
  | 'waistRight'
  | 'hipLeft'
  | 'hipRight'
  | 'crotch'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle'

export type BodyKeypoints = Record<BodyKeypointName, Point>

export type GarmentLayer = 'upper' | 'lower' | 'fullBody'

export type UpperGarmentAnchorName =
  | 'neck'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftHem'
  | 'rightHem'

export type LowerGarmentAnchorName =
  | 'waistLeft'
  | 'waistRight'
  | 'hemLeft'
  | 'hemRight'

export type FullBodyGarmentAnchorName =
  | UpperGarmentAnchorName
  | LowerGarmentAnchorName

export type GarmentAnchorPoints =
  | Record<UpperGarmentAnchorName, Point>
  | Record<LowerGarmentAnchorName, Point>
  | Record<FullBodyGarmentAnchorName, Point>

export type PhotoTryOnGarment = {
  id: string
  name: string
  category: string
  price: string
  description: string
  fit: string
  fabric: string
  imageUrl: string
  layer: GarmentLayer
  naturalSize: Size
  anchorPoints: GarmentAnchorPoints
  fitLengthRatio?: number
}

export type GarmentTransform = {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  opacity: number
}

export const PHOTO_TRY_ON_CANVAS_SIZE: Size = {
  width: 560,
  height: 760,
}

export const defaultGarmentTransform: GarmentTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 0.82,
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function fitImageToCanvas(imageSize: Size, canvasSize: Size): Rect {
  const scale = Math.min(canvasSize.width / imageSize.width, canvasSize.height / imageSize.height)
  const width = imageSize.width * scale
  const height = imageSize.height * scale

  return {
    x: (canvasSize.width - width) / 2,
    y: (canvasSize.height - height) / 2,
    width,
    height,
  }
}

const bodyKeypointRatios: BodyKeypoints = {
  neck: { x: 0.5, y: 0.229 },
  leftShoulder: { x: 0.394, y: 0.261 },
  rightShoulder: { x: 0.606, y: 0.261 },
  waistLeft: { x: 0.414, y: 0.418 },
  waistRight: { x: 0.588, y: 0.418 },
  hipLeft: { x: 0.383, y: 0.486 },
  hipRight: { x: 0.617, y: 0.486 },
  crotch: { x: 0.5, y: 0.545 },
  leftKnee: { x: 0.454, y: 0.688 },
  rightKnee: { x: 0.544, y: 0.688 },
  leftAnkle: { x: 0.467, y: 0.872 },
  rightAnkle: { x: 0.533, y: 0.872 },
}

export function initializeBodyKeypoints(photoRect: Rect): BodyKeypoints {
  const px = (value: number) => photoRect.x + photoRect.width * value
  const py = (value: number) => photoRect.y + photoRect.height * value

  return {
    neck: { x: px(bodyKeypointRatios.neck.x), y: py(bodyKeypointRatios.neck.y) },
    leftShoulder: {
      x: px(bodyKeypointRatios.leftShoulder.x),
      y: py(bodyKeypointRatios.leftShoulder.y),
    },
    rightShoulder: {
      x: px(bodyKeypointRatios.rightShoulder.x),
      y: py(bodyKeypointRatios.rightShoulder.y),
    },
    waistLeft: {
      x: px(bodyKeypointRatios.waistLeft.x),
      y: py(bodyKeypointRatios.waistLeft.y),
    },
    waistRight: {
      x: px(bodyKeypointRatios.waistRight.x),
      y: py(bodyKeypointRatios.waistRight.y),
    },
    hipLeft: { x: px(bodyKeypointRatios.hipLeft.x), y: py(bodyKeypointRatios.hipLeft.y) },
    hipRight: { x: px(bodyKeypointRatios.hipRight.x), y: py(bodyKeypointRatios.hipRight.y) },
    crotch: { x: px(bodyKeypointRatios.crotch.x), y: py(bodyKeypointRatios.crotch.y) },
    leftKnee: {
      x: px(bodyKeypointRatios.leftKnee.x),
      y: py(bodyKeypointRatios.leftKnee.y),
    },
    rightKnee: {
      x: px(bodyKeypointRatios.rightKnee.x),
      y: py(bodyKeypointRatios.rightKnee.y),
    },
    leftAnkle: {
      x: px(bodyKeypointRatios.leftAnkle.x),
      y: py(bodyKeypointRatios.leftAnkle.y),
    },
    rightAnkle: {
      x: px(bodyKeypointRatios.rightAnkle.x),
      y: py(bodyKeypointRatios.rightAnkle.y),
    },
  }
}

export function fitUpperGarmentToBody(
  bodyKeypoints: BodyKeypoints,
  garment: PhotoTryOnGarment,
): GarmentTransform {
  const anchors = garment.anchorPoints as Record<UpperGarmentAnchorName, Point>
  const bodyShoulderWidth = distance(bodyKeypoints.leftShoulder, bodyKeypoints.rightShoulder)
  const garmentShoulderWidth = distance(anchors.leftShoulder, anchors.rightShoulder)
  const bodyUpperLength =
    averagePoint(bodyKeypoints.waistLeft, bodyKeypoints.waistRight).y - bodyKeypoints.neck.y
  const garmentUpperLength = averagePoint(anchors.leftHem, anchors.rightHem).y - anchors.neck.y
  const scaleX = (bodyShoulderWidth / garmentShoulderWidth) * 1.2
  const scaleY = (bodyUpperLength / garmentUpperLength) * 1.2
  const rotation =
    angleBetween(bodyKeypoints.leftShoulder, bodyKeypoints.rightShoulder) -
    angleBetween(anchors.leftShoulder, anchors.rightShoulder)

  return {
    x: bodyKeypoints.neck.x - anchors.neck.x * scaleX,
    y: bodyKeypoints.neck.y - anchors.neck.y * scaleY - bodyUpperLength * 0.08,
    scaleX,
    scaleY,
    rotation,
    opacity: 0.82,
  }
}

export function fitLowerGarmentToBody(
  bodyKeypoints: BodyKeypoints,
  garment: PhotoTryOnGarment,
): GarmentTransform {
  const anchors = garment.anchorPoints as Record<LowerGarmentAnchorName, Point>
  const bodyWaistLeft = bodyKeypoints.waistLeft
  const bodyWaistRight = bodyKeypoints.waistRight
  const bodyWaistCenter = averagePoint(bodyWaistLeft, bodyWaistRight)
  const garmentWaistCenter = averagePoint(anchors.waistLeft, anchors.waistRight)
  const bodyWaistWidth = distance(bodyWaistLeft, bodyWaistRight)
  const garmentWaistWidth = distance(anchors.waistLeft, anchors.waistRight)
  const bodyHemCenter = averagePoint(bodyKeypoints.leftAnkle, bodyKeypoints.rightAnkle)
  const garmentHemCenter = averagePoint(anchors.hemLeft, anchors.hemRight)
  const scaleX = (bodyWaistWidth / garmentWaistWidth) * 1.58
  const scaleY =
    ((bodyHemCenter.y - bodyWaistCenter.y) / (garmentHemCenter.y - garmentWaistCenter.y)) *
    (garment.fitLengthRatio ?? 0.92)
  const rotation =
    angleBetween(bodyWaistLeft, bodyWaistRight) -
    angleBetween(anchors.waistLeft, anchors.waistRight)

  return {
    x: bodyWaistCenter.x - garmentWaistCenter.x * scaleX,
    y: bodyWaistCenter.y - garmentWaistCenter.y * scaleY - bodyWaistWidth * 0.08,
    scaleX,
    scaleY,
    rotation,
    opacity: 0.78,
  }
}

function distance(start: Point, end: Point) {
  return Math.hypot(end.x - start.x, end.y - start.y)
}

function averagePoint(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  }
}

function angleBetween(start: Point, end: Point) {
  return (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI
}
