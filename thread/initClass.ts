import IPCPort, { REQUEST } from 'common/network/IPCPort'
import { SELF } from 'common/util/constant'
import * as is from 'common/util/is'
import { CHeapError } from '../error'

export default function init(run: (...args: any[]) => any) {

  let ipc: IPCPort
  let target: any

  function initIPC(port: MessagePort) {
    ipc = new IPCPort(port)
    ipc.on(REQUEST, async (data: any) => {
      const method = data.method
      const params = data.params

      if (is.func(target[method])) {
        try {
          const transfer = []
          const result = await target[method](...params.params, transfer)
          ipc.reply(data, result, null, transfer)
        }
        catch (error) {
          ipc.reply(data, CHeapError.REQUEST_ERROR, {
            message: error.message
          })
        }
      }
    })
  }

  SELF.onmessage = (message) => {
    const origin = message.data
    const type = origin.type
    const data = origin.data

    switch (type) {
      case 'init':
        if (SELF.CHeap && SELF.CHeap.initThread) {
          SELF.CHeap.initThread(data).then(() => {
            SELF.postMessage({
              type: 'ready'
            })
          })
          return
        }
        SELF.postMessage({
          type: 'ready'
        })
        break
      case 'run':

        SELF.postMessage({
          type: 'running'
        })

        target = run(data.params)

        initIPC(data.port)

        break
      case 'stop':
        if (ipc) {
          ipc.destroy()
        }
        SELF.postMessage({
          type: 'stopped'
        })
        break
      default:
        break
    }
  }
}
