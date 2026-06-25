SoloIdleSaga/
├─ index.html               # 游戏入口首页（导航栏：战斗页/角色装备页切换）
├─ pages/
│  ├─ battle.html           # 界面1：关卡选择+自动战斗+战斗/掉落日志
│  └─ character.html        # 界面2：角色属性+6部位装备穿戴+背包
├─ css/
│  ├─ common.css            # 全局公共样式（按钮、弹窗、滚动条、稀有度颜色）
│  ├─ battle.css            # 战斗页专属样式（战斗动画、日志面板）
│  └─ character.css         # 角色装备页样式（装备格子、属性面板）
├─ js/
│  ├─ config/
│  │  ├─ gameConfig.js      # 全局配置：角色基础属性、稀有度、词条库、装备库、怪物配置、掉落概率
│  │  └─ levelConfig.js     # 关卡、难度、12阶段怪物属性、成长公式配置
│  ├─ core/
│  │  ├─ saveManager.js     # 本地离线存储+上线离线收益计算
│  │  ├─ cloudSave.js       # 云存档、3存档位、账号同步
│  │  ├─ versionUpdate.js   # 无感知版本自动升级检测
│  │  ├─ attrCalculator.js  # 属性计算公式、伤害计算、护甲减伤、暴击计算
│  │  ├─ equipGenerator.js  # 装备随机生成、稀有度随机、T阶词条随机
│  │  └─ battleEngine.js    # 自动战斗核心引擎、波次刷新、怪物AI、战斗日志

│  └─ app.js               # 整合战斗、背包、云存档、Tab、实时刷新
│  └─ main.js               # 全局初始化、页面跳转、存档加载、版本校验
└─ assets/                  # 静态资源文件夹（后续放怪物、装备图标）
   └─ images/