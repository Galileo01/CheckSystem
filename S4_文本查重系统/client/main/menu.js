const { Menu } = require('electron')

const template = [
    {
        label: '系统',
        submenu: [
            { label: '关于', id: '1' },
        ]

    },{
        label: '开发者',
        submenu: [
            { label: '关于', id: '1' },
        ]
    }
]

const menu = Menu.buildFromTemplate(template)

Menu.setApplicationMenu(menu)