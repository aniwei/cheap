import { getHeapU8, Allocator, getHeapU16, getHeap8, getHeapU32,
  getHeap16, getHeap32, getHeapU64, getHeap64, getHeapF32, getHeapF64
} from '../heap'
import { strlen } from './string'
import * as text from 'common/util/text'
import { CTypeEnum } from '../typedef'
import { CTypeEnumWrite } from '../ctypeEnumWrite'
import SafeUint8Array from './buffer/SafeUint8Array'
import * as config from '../config'

export function memcpy(dst: anyptr, src: anyptr, size: size) {
  assert(dst && src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(dst), `dst address ${dst} is not alloc`)
  getHeapU8().set(getHeapU8().subarray(src, src + size), dst)
}

export function memcpyFromUint8Array(src: pointer<void>, max: size, data: Uint8Array) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  getHeapU8().set(data.subarray(0, max), src)
}

export function memmove(dst: anyptr, src: anyptr, size: size) {
  assert(dst && src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(dst), `dst address ${dst} is not alloc`)
  getHeapU8().copyWithin(dst, src, src + size)
}

export function memset(src: anyptr, c: uint8, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  getHeapU8().subarray(src, src + n).fill(c)
}

export function mapSafeUint8Array(src: pointer<void>, n: size): SafeUint8Array {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return config.USE_THREADS ? mapUint8Array(src, n) as any as SafeUint8Array : new SafeUint8Array(reinterpret_cast<pointer<uint8>>(src), n)
}

export function mapUint8Array(src: pointer<void>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeapU8().subarray(src, src + n)
}

export function mapInt8Array(src: pointer<int8>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeap8().subarray(src, src + n)
}

export function mapUint16Array(src: pointer<uint16>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeapU16().subarray(src >>> 1, src + n)
}

export function mapInt16Array(src: pointer<int16>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeap16().subarray(src >>> 1, src + n)
}

export function mapUint32Array(src: pointer<uint32>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeapU32().subarray(src >>> 2, src + n)
}

export function mapInt32Array(src: pointer<int32>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeap32().subarray(src >>> 2, src + n)
}

export function mapUint64Array(src: pointer<uint64>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeapU64().subarray(src >>> 3, src + n)
}

export function mapInt64Array(src: pointer<int64>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeap64().subarray(src >>> 3, src + n)
}

export function mapFloat32Array(src: pointer<float>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeapF32().subarray(src >>> 2, src + n)
}

export function mapFloat64Array(src: pointer<double>, n: size) {
  assert(src, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(src), `src address ${src} is not alloc`)
  return getHeapF64().subarray(src >>> 3, src + n)
}

export function readCString(pointer: pointer<char>, max?: uint32) {
  assert(pointer, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(pointer), `address ${pointer} is not alloc`)

  const stringLen = strlen(reinterpret_cast<pointer<char>>(pointer))
  const len = Math.min(stringLen, max ?? stringLen)
  return text.decode(mapUint8Array(pointer, len))
}

export function writeCString(dst: pointer<void>, str: string, max?: uint32, addNull: boolean = true) {

  assert(dst, 'Out Of Bounds, address: 0')
  assert(Allocator.isAlloc(dst), `dst address ${dst} is not alloc`)

  const data = text.encode(str)

  let len = data.length
  let remain = addNull ? 1 : 0

  if (max && len - remain > max) {
    len = max - remain
  }

  memcpyFromUint8Array(dst, len, data)

  if (addNull) {
    CTypeEnumWrite[CTypeEnum.int8](dst + len, 0)
  }
}
