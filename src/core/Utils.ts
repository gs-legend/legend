export const customizeTimer = {
    intervalTimer: <any>null,
    timeoutTimer: <any>null,
    setTimeout(cb: () => void, interval: number) {
        const { now } = Date
        const stime = now()
        let etime = stime
        const loop = () => {
            this.timeoutTimer = requestAnimationFrame(loop)
            etime = now()
            if (etime - stime >= interval) {
                cb()
                cancelAnimationFrame(this.timeoutTimer)
            }
        }
        this.timeoutTimer = requestAnimationFrame(loop)
        return this.timeoutTimer;
    },
    clearTimeout() {
        cancelAnimationFrame(this.timeoutTimer)
    },
    setInterval(cb: () => void, interval: number) {
        const { now } = Date
        let stime = now()
        let etime = stime
        const loop = () => {
            this.intervalTimer = requestAnimationFrame(loop)
            etime = now()
            if (etime - stime >= interval) {
                stime = now()
                etime = stime
                cb()
            }
        }
        this.intervalTimer = requestAnimationFrame(loop)
        return this.intervalTimer
    },
    clearInterval() {
        cancelAnimationFrame(this.intervalTimer)
    }
}

export const deepClone = (obj: CommonObjectType) => {
    if (
        obj === null ||
        typeof obj !== 'object' ||
        obj instanceof Date ||
        obj instanceof Function
    ) {
        return obj
    }
    const cloneObj = Array.isArray(obj) ? [] : {}
    Object.keys(obj).map((key) => {
        cloneObj[key] = deepClone(obj[key])
        return cloneObj
    })
    return cloneObj
}

export const getQuery = (): CommonObjectType<string> => {
    const { href } = window.location
    const query = href.split('?')
    if (!query[1]) return {}

    const queryArr = decodeURI(query[1]).split('&')
    const queryObj = queryArr.reduce((prev, next) => {
        const item = next.split('=')
        return { ...prev, [item[0]]: item[1] }
    }, {})
    return queryObj
}

export const flattenRoutes = (arr: CommonObjectType<unknown>[]) =>
    arr.reduce(
        (prev: CommonObjectType<unknown>[], item: CommonObjectType<unknown>) => {
            if (Array.isArray(item.routes)) {
                prev.push(item)
            }
            return prev.concat(
                Array.isArray(item.routes) ? flattenRoutes(item.routes) : item
            )
        },
        []
    )

export const asyncAction = (action: unknown) => {
    const wait = new Promise((resolve) => {
        resolve(action)
    })
    return (cb: () => void) => {
        wait.then(() => setTimeout(() => cb()))
    }
}

export const closeTabAction = (history: CommonObjectType, returnUrl: string = '/', cb?: () => void) => {
    // const { curTab } = store.getState().tabsView;
    // const { href } = window.location;
    // const pathname = href.split('#')[1];
    // const tabArr = JSON.parse(JSON.stringify(curTab));
    // const delIndex = tabArr.findIndex((item: string) => item === pathname);
    // tabArr.splice(delIndex, 1);

    // if (!tabArr.includes(returnUrl)) {
    //     tabArr.push(returnUrl)
    // }

    // const setTab = store.dispatch({
    //     type: 'SET_CURTAB',
    //     payload: tabArr
    // })
    // const reloadTab = store.dispatch({
    //     type: 'SET_RELOADPATH',
    //     payload: returnUrl
    // })
    // const stopReload = setTimeout(() => {
    //     store.dispatch({
    //         type: 'SET_RELOADPATH',
    //         payload: 'null'
    //     })
    // }, 500)

    // const action = () => setTab && reloadTab && stopReload

    // const callback = () => {
    //     if (cb && typeof cb === 'function') {
    //         return cb
    //     }
    //     return history.push({
    //         pathname: returnUrl
    //     })
    // }

    // asyncAction(action)(callback)
}
