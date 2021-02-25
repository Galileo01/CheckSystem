"use strict";
const { remote } = require('electron');//引入渲染模块
const { shell, BrowserWindow } = remote;
const path = require('path');
import { writePdf_preview_410, showNotif_410, setWindowSize_410, throttlen_410, readDoc_410 } from './utils.js';


//入口组件
const Entrance_410 = {
    name: 'Entrance',
    template: '#entrance_tem',
    data() {
        return {
            isFileChoosed: false,
            params: {
                minSimilarity: 0.1,
                checkAlgorithm: 1,
                file: {
                    name: '',
                    size: 0,
                    type: 'html',
                    path: '',
                    raw: null
                }
            },
            tooltip: '',
            //算法选择
            Algorithms: [
                {
                    value: 1,
                    label: 'SimHash'
                },
                {
                    value: 2,
                    label: 'K-Single'
                }, {
                    value: 3,
                    label: '基于tf_idf的余弦相似'
                }
            ]
        };
    },
    methods: {
        //文件状态改变
        fileChange({ raw }) {
            if (this.isFileChoosed) return;
            // console.log(raw);
            this.isFileChoosed = true;
            setWindowSize_410(600, 500);//设置窗口大小
            const { name, ext } = path.parse(raw.name);//解析文件名和扩展名
            console.log(name, ext);
            this.params.file.raw = raw;
            this.params.file.name = name;
            this.params.file.type = ext.slice(1);
            this.params.file.path = raw.path;
            this.params.file.size = raw.size;
            this.tooltip = `预览${ext.slice(1)}文件`;
            showNotif_410('文件加载成功');
        },
        //上传
        submit() {
            //交给根实例 提交文档
            this.$emit('submit', this.params);
            this.reset();
        },
        //重新选择文件
        reChoose() {
            this.isFileChoosed = false;
            setWindowSize_410(400, 300)
        },
        // 预览点击
        previewClick() {
            switch (this.params.file.type) {
                case 'pdf':
                    this.openAPdf();
                    break;
                case 'html':
                    this.openAHtml();
                    break;
                default:
                    this.openOther();
                    break;
            }
        },
        //打开一个 doc
        openOther() {
            //默认方式打开给定的文件
            shell.openPath(this.params.file.path)
                .then(res => {
                    console.log(res);
                }).catch(err => {
                    this.$message.error('预览失败');

                    console.log(err);
                })
        },
        async openAPdf() {
            const res = await writePdf_preview_410(this.params.file.name, this.params.file.path);

            //如果路径替换成功
            if (res !== 'success') return this.$message.error('PDF文件预览失败');
            let child = new BrowserWindow(
                {
                    width: 800,
                    height: 600
                    , modal: true,
                    autoHideMenuBar: true,//隐藏 菜单栏
                }
            );
            child.loadFile('./pdf_preview.html');//加载页面
            child.maximize()//以最大化的形式展示窗口
            child.on('closed', () => {
                child = null;//关闭窗口 清空窗口
            })
        },
        //打开一个新的 html 窗口
        openAHtml() {
            // shell.openExternal(this.params.file.path);
            let child = new BrowserWindow(
                {
                    width: 800,
                    height: 600
                    , modal: true,
                    autoHideMenuBar: true,//隐藏 菜单栏
                }
            );
            child.loadFile(this.params.file.path);//加载对应的html文件
            child.maximize()//以最大化的形式展示窗口
            child.on('closed', () => {
                child = null;//关闭窗口 清空窗口
            })
        },
        //重置
        reset() {
            this.isFileChoosed = false;
            this.params = {
                minSimilarity: 0.1,
                checkAlgorithm: 1,
                file: {
                    name: '',
                    size: 0,
                    type: 'html',
                    path: '',
                    raw: null
                }
            }
        }
    }
};

//结果展示组件
const Result_410 = {
    name: 'Result',
    template: '#result_tem',
    data() {
        return {
            currentMode: 'show',//当前 模式 show.compare,
            //当前比较的文档
            currentCompareData: { //测试数据
                docname: 'aest',
                similarity: 0.1,
                num: 2, type: 'docx',
                positions: [
                    [1, 6],
                    [9, 15],
                ],
                content: '撒大苏打实打实撒大苏打实打实大苏打实打实的',
                htmlStr: '',//根据重复位置生成的html 字符串
            },
            showList: this.checkResult,//当前展示的文档列表
            currentBetween: "-1",//当前所在的取区间
            stepsObject: [],//记录被告区间的信息
            //用户文档内容 标记之后的字符串
            userDocHtmlStr: '',
            echartsIns: null,
            tableColumnWidth: 0,//一列的宽度
        };
    },
    components: {
    },
    props: {
        //用户上传的文件信息
        userDocInfo: {
            type: Object,
            default() {
                return {

                }
            }
        },
        checkResult: {
            type: Array,
            default() {
                const res = [
                    {
                        "docname": "10.txt",
                        "similarity": 0.49230769230769234,
                        "num_of_doc_position": [],
                        "num_of_self_position": [],
                        "num_of_doc": 0,
                        "num_of_self": 0,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "\n　　本报讯(记者王京)联想THINKPAD近期几乎全系列笔记本电脑降价促销，最高降幅达到800美元，降幅达到42%。这是记者昨天从联想美国官方网站发现的。\n　　联想相关人士表示，这是为纪念新联想成立1周年而在美国市场推出的促销，产品包括THINKPAD\nT、X以及Z系列笔记本。促销不是打价格战，THINK品牌走高端商务路线方向不会改变。",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "100.txt",
                        "similarity": 1,
                        "num_of_doc_position": [
                            [
                                0,
                                33
                            ],
                            [
                                34,
                                38
                            ],
                            [
                                39,
                                55
                            ],
                            [
                                56,
                                67
                            ],
                            [
                                68,
                                79
                            ],
                            [
                                80,
                                97
                            ],
                            [
                                98,
                                113
                            ],
                            [
                                114,
                                124
                            ],
                            [
                                125,
                                129
                            ],
                            [
                                130,
                                141
                            ],
                            [
                                142,
                                175
                            ],
                            [
                                176,
                                212
                            ],
                            [
                                213,
                                227
                            ],
                            [
                                232,
                                236
                            ],
                            [
                                237,
                                250
                            ],
                            [
                                251,
                                255
                            ],
                            [
                                256,
                                297
                            ],
                            [
                                298,
                                329
                            ],
                            [
                                330,
                                388
                            ],
                            [
                                389,
                                426
                            ],
                            [
                                427,
                                446
                            ],
                            [
                                447,
                                454
                            ],
                            [
                                455,
                                469
                            ]
                        ],
                        "num_of_self_position": [
                            [
                                0,
                                33
                            ],
                            [
                                34,
                                38
                            ],
                            [
                                39,
                                55
                            ],
                            [
                                56,
                                67
                            ],
                            [
                                68,
                                79
                            ],
                            [
                                80,
                                97
                            ],
                            [
                                98,
                                113
                            ],
                            [
                                114,
                                124
                            ],
                            [
                                125,
                                129
                            ],
                            [
                                130,
                                141
                            ],
                            [
                                142,
                                175
                            ],
                            [
                                176,
                                212
                            ],
                            [
                                213,
                                227
                            ],
                            [
                                232,
                                236
                            ],
                            [
                                237,
                                250
                            ],
                            [
                                251,
                                255
                            ],
                            [
                                256,
                                297
                            ],
                            [
                                298,
                                329
                            ],
                            [
                                330,
                                388
                            ],
                            [
                                389,
                                426
                            ],
                            [
                                427,
                                446
                            ],
                            [
                                447,
                                454
                            ],
                            [
                                455,
                                469
                            ]
                        ],
                        "num_of_doc": 23,
                        "num_of_self": 23,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。\n　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。\n　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。\n　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。\n　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。\n　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "1000.txt",
                        "similarity": 0.4230769230769231,
                        "num_of_doc_position": [],
                        "num_of_self_position": [],
                        "num_of_doc": 0,
                        "num_of_self": 0,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "　　【eNet硅谷动力消息】据国外媒体报道，一名德国的数据库安全工程师日前撰文指出，到目前为止，甲骨文软件产品中还有44个尚未修补的漏洞。这些漏洞从被发现至今从十二天到两年半不等。\n　　德国信息安全机构“红色数据库安全”的工程师亚力山大・科布鲁斯特日前在Buqtraq安全邮件列表上发表了这篇文章。他说，这四十四个漏洞主要集中在甲骨文的数据库产品上。其中，最老的漏洞早在两年半之前被发现者报告给了甲骨文，最新的漏洞则是在十二天之前被发现。\n　　科布鲁斯特谈及的四十四个漏洞包括各种SQL语句插入漏洞、交叉脚本攻击漏洞、明文密码泄露漏洞等。他说，这些漏洞在甲骨文公司未来的安全更新中将得到修补，但他也不清楚甲骨文升级软件或发布修补具体漏洞的时间。\n　　去年，甲骨文首席安全官玛丽・安娜・戴维德森的一席话在信息安全界引发骚动。安娜称，在已经发现的甲骨文软件漏洞中，有四分之三是该公司自己的工程师发现的。科布鲁斯特据此计算，甲骨文软件尚未得到修补的漏洞应该在一百六十个左右。\n　　“让我们作一个算术，根据玛丽・安娜・戴维德森的说法，四分之三的漏洞是甲骨文自己发现的，我们发现的四十四个如果是剩下的四分之一，那么甲骨文至今尚未修改的至少还有一百六十个漏洞。”科布鲁斯特在文章中写道。\n　　近来，有关甲骨文软件漏洞的新闻又不时涌现网络。两周前，甲骨文发布的新安全更新包号称修补了三十多个漏洞，随后，NGS软件公司的工程师大卫・里奇菲尔德曝出，甲骨文三次发布补丁也没有能把一个存在两年多的漏洞修补好。\n　　科布鲁斯特在其文章中得出结论说：“在修补软件漏洞方面，甲骨文的确有点慢条斯理。”",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "1001.txt",
                        "similarity": 0.5076923076923077,
                        "num_of_doc_position": [],
                        "num_of_self_position": [],
                        "num_of_doc": 0,
                        "num_of_self": 0,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "　　作者：令狐达\n　　【eNet硅谷动力消息】据国外媒体报道，美国高科技市场调研公司M:Metrics5月2日发布了一份有关手机游戏的市场分析报告。报告得出令移动运营商失望的结论：手机游戏目前处于停滞不前的状态，其主要原因是各国消费者认为手机下载游戏价格过高、选择范围有限。\n　　M:Metrics出台的这份报告针对对美国、英国和德国等国家手机用户下载游戏的行为习惯进行了调查分析。结果发现，下载游戏者在手机用户中的比例非常少，而这个比例在过去几年中一直没有增长。数据显示，今年3月份，美国下载游戏者占手机用户的的2.7%，德国的比例为2.5%，英国为4.2%。\n　　竟然没有一个市场的比例超过两位数。\n　　M:Metrics调查发现，在下载游戏的手机用户中，有30%是第一次下载。不过，首次下载者中仅有20%至30%用户打算继续下载更多游戏。\n　　M:Metrics公司高级分析师SeamusMcAteer表示，数据显示，移动运营商还有很多的工作要做，以便把普通的游戏玩家变成“下载游戏”的爱好者。他说，目前运营商的手机门户上并不缺乏新游戏，很多运营商推出了创新游戏，但却无法“吊起”游戏玩家的胃口。\n　　McAteer说，手机用户不愿下载游戏的主要原因有价格太高、引发不了兴趣，以及可选择的游戏太少。调查结果显示，40%的德国手机用户表示他们不下载手机游戏的首要原因是价格太高，持同样看法的英国手机用户为23.75%，美国手机用户为21%。\n　　M:Metrics的报告还发现：在手机游戏方面男女性别差异较小，他们都很喜欢手机下载游戏。不过，18岁到34岁的青少年是对手机游戏最热衷的消费群体。在这个年龄段，35％的美国手机用户下载游戏，英国的比例为30％，德国的比例为33.7％。\n　　另外一个市场调研机构ABI的分析师KenHyers表示，对于这种结果，他并不感到奇怪。“我认为，在有关对手机游戏感兴趣的玩家数量上，可能达到了一种饱和。基于目前的硬件平台，手机游戏已经发挥到了极致。手机并不是玩游戏的好平台。对于移动游戏来说，PlayStation掌机和任天堂的掌机可能是更好的选择。”",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "1002.txt",
                        "similarity": 0.5076923076923077,
                        "num_of_doc_position": [],
                        "num_of_self_position": [],
                        "num_of_doc": 0,
                        "num_of_self": 0,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "&nbsp;&nbsp;&nbsp;作者：令狐达\n　　【eNet硅谷动力消息】据台湾媒体引述笔记本厂商消息人士透露，Turion64X2是全球微处理器“老二”AMD公司推出的首款双核加64位的PC处理器。此前，AMD公司计划在5月9日推出这款微处理器，不过，AMD公司最近决定将它的发布日期推迟到6月份。\n　　媒体分析认为，AMD推出Turion64X2的原因可能和微软延期推出WindowsVista操作系统有关。受到微软延期影响，很多笔记本厂商纷纷将推出新产品的时间表向后推延，这迫使AMD公司调整这款双核64位处理器的上市时间。\n　　AMD台湾分公司拒绝对这个传言作出证实，但表示其Turion64X2处理器的上市时间和客户推出新产品的时间是有关系的。\n　　Vista方面，5月2日，美国市场调研公司Gartner表示，微软WindowsVista操作系统的上市时间有可能从明年1月份再次推迟3个月，即在明年第二季度才上市。",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "1003.txt",
                        "similarity": 0.5076923076923077,
                        "num_of_doc_position": [],
                        "num_of_self_position": [],
                        "num_of_doc": 0,
                        "num_of_self": 0,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "　　作者：令狐达\n　　【eNet硅谷动力消息】据台湾媒体报道，液晶显示器大厂宏基公司的美国分公司5月3日在美国当地推出了一款支持两毫秒响应时间的十九寸液晶显示器。这款高性能液晶显示器可以用于游戏、多媒体、桌面出版等高端应用领域。\n　　这款液晶显示器的型号是AL1951。除了两毫秒的响应时间外，该显示器还支持1000：1的对比度和DVI数字视频接口，亮度为300明流。\n　　据悉，宏基这款显示器能够支持高性能的图形应用，可以充当桌面游戏平台、欣赏动作大片。\n　　这款显示器在北美售价为379美元，通过宏基授权经销商在美国各地发售。",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "1004.txt",
                        "similarity": 0.5,
                        "num_of_doc_position": [
                            [
                                44,
                                48
                            ]
                        ],
                        "num_of_self_position": [
                            [
                                125,
                                129
                            ]
                        ],
                        "num_of_doc": 1,
                        "num_of_self": 1,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "　　【eNet硅谷动力消息】5月4日消息本周二，Sun微系统公司表示要继续整合于去年以41亿美元收购的StorageTek公司的技术，并宣布公司的企业存储、管理和安全数据等整体战略。\n　　Sun指出，身份管理、虚拟技术、安全和技术整合是公司未来战略的四大核心。公司推出的新产品包括SunStorageTek5320NASAppliance、FibreChannel以及SerialATA、StorageTekVirtualStorageManager(VSM)等。\n　　在身份管理产品方面，Sun公司整合了于2003年收购的Waveset公司的技术，并将其应用于StorageTek企业存储管理软件，以查询、监测、汇报存储资源使用情况。麦克利尼称，\"身份管理是ILM架构中最为重要的元素\"。他指出，随着互联网的广泛应用和博客、播客以及视频等数据大的大量涌现，企业面临管理数据的巨大挑战。\"所有这一切都于数据有关，而不是存储。世界在改变，我们正从互联网时代进入参与时代，届时互联网上每个人都是发行者，都是编辑。\"\n　　同时，Sun还推出了新的产品ManagedOperationsforStorage，以帮助企业管理数据，降低存储管理的成本，降低数据损失的风险。Sun还推出了InformationManagementMaturityModel(IM3)平台以帮助企业检查存在于ILM战略中的弱项。今年6月，Sun将在Solaris10中推出新一代存储文件系统ZFS，实现存储管理的自动存储，增强数据的整合。",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "1005.txt",
                        "similarity": 0.5538461538461539,
                        "num_of_doc_position": [],
                        "num_of_self_position": [],
                        "num_of_doc": 0,
                        "num_of_self": 0,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "　　【eNet硅谷动力消息】据市场调研机构IDC公司公布最新调查报告称，今年第一季度全球PDA的销售已经低于150万部，这标志着全球PDA的发货量连续九个季度出现了下滑。\n　　调研公司表示，今年第一季度全球PDA发货量总数为147万部，比去年同期下滑了22.3%。分析师RamonLlamas明确表示，由于增加了核心用户共同需求的蓝牙连接、Wi-Fi功能、扩展的内存容量和整合了GPS(全球卫星定位系统)等许多新的功能，PDA的需求将保持在这一水平停止继续下滑。\n　　调研公司定义PDA是可装于口袋的袖珍电子装置，尽管缺乏电话功能，但它能够收发电子邮件、为数据登录提供了铁笔或键区，它能够和笔记本电脑或台式机同步数据。\n　　尽管PDA发货量下滑影响了所有主要的PDA制造商，但今年第一季度全球PDA销售排名没有大的变化，奔迈公司是PDA市场的领先厂商，它的市场份额达到32.2%仍然稳坐头把交椅；排名第二的是惠普公司，它的市场份额为23.5%；戴尔公司被排在第三位，它的市场份额为9.7%；中国台湾宏基公司排名第四，它的市场份额为7.5%。唯一发生变化的是排名第五的中国苏州宇达电通（MioTechnology）公司，它扭转了市场的趋势，今年第一季度它的PDA的发货量比去年第一季度增长了84.4%，把德国的Medion公司挤出了最高前五名队伍。\n　　所有的新闻并不都是消极的，PDA制造商表示，PDA较低的成本是吸引新用户的最好的途径。奔迈公司发言人JimChristensen表示，公司的PDA和智能手机的发货量继续获得了增长。他说：“我们的PDA业务不仅利润丰厚，我们的用户基础也获得了增长，晚些时候我们将把PDA升级成一款高端手持电脑或Treo智能手机。”\n　　奔迈公司表示，60%的没有PDA的用户选择了奔迈公司的99美元的Z22作为他们的首款手持电脑。由于新的客户对奔迈公司的重视，许多公司在去年五月份确定，向奔迈操作系统续签了五年的合同。",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "1006.txt",
                        "similarity": 0.4461538461538462,
                        "num_of_doc_position": [
                            [
                                343,
                                347
                            ]
                        ],
                        "num_of_self_position": [
                            [
                                125,
                                129
                            ]
                        ],
                        "num_of_doc": 1,
                        "num_of_self": 1,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "　　【赛迪网讯】5月4日外电消息，十年前微软就进入了原创娱乐网络服务领域，但由于条件不成熟，微软的原创媒体计划后来一度搁浅，今天，微软卷土重来，与上次的不同之处在于，此次微软得到了全球第一大娱乐品牌好莱坞的支持。\n　　据国外媒体报道，微软MSN网络部门日前与好莱坞签署了数百万美元的合作协议，在一年的合同期内，好莱坞将为MSN提供10部原创连续剧，其中有4倍剧目已经开拍。\n　　微软大力加强MSN门户的内容力量是出于与Google、雅虎和AOL展开竞争的需要，最终目的是吸引更多网络用户，从而为广告服务奠定基础。\n　　预计微软将于今天举行的MSN战略峰会上宣布上述合作协议，此次会议召集了大量业界知名的营销、技术及娱乐高层来参加。\n　　微软上次进入网络内容领域是1996－1997年，当时投入了1亿美元用于创作《475麦迪逊》等剧目，但由于没有达到预期的创收目的，随后几年中微软网络服务逐渐转向更为实用和功利的内容。\n　　随着宽带的进一步普及和观众对网络视频的认可，微软高层再一次萌发了原创娱乐内容的想法，当然这一想法的前提是微软MSN门户已集聚了大规模的用户群体。\n　　除了继续从NBC等媒体及娱乐公司购买放映许可和用户自编的娱乐内容之外，MSN此次又尝试与好莱坞合作制作原创内容，以此作为MSN内容服务的第三条道路。(c000)",
                        "doc_format": "txt"
                    },
                    {
                        "docname": "1007.txt",
                        "similarity": 0.5076923076923077,
                        "num_of_doc_position": [],
                        "num_of_self_position": [],
                        "num_of_doc": 0,
                        "num_of_self": 0,
                        "self_message": "　　【赛迪网讯】5月10日消息思科周二盘后发布了其财年第三季度财报。财报显示，受股票期权开支及收购相关费用影响，虽然本季度营收实现增长，但净利润却同比略有下降。　　据Maketwatch网站报道，思科本季度实现净利润14亿美元，略低于去年同期的14.1亿美元。本季度每股收益22美分，去年同期的每股收益为21美分（思科去年同期发行的股票数量多于今年）。ThomsonFirstCall调查的分析师此前预计的每股收益为23美分。　　本季度营收同比增长18％，至73.2亿美元，高于华尔街分析师预计的71.7亿美元。思科新近收购的Scientific-Atlanta公司对本季度的营收增长做出了贡献。　　思科在上个世纪90年代凭借进行的数十例收购实现了发展的目的。现在它又希望能借助以69亿美元的价格收购来的Scientific-Atlanta公司来扩大其在互联网设备市场上的份额。　　由于分析师和投资者看好思科对Scientific-Atlanta的收购，思科股价自进入今年以来已上涨了约28％。　　财报发布后，思科股票在盘后交易中上涨4％。",
                        "doc_message": "　　【赛迪网讯】5月4日外电消息，802.11n标准草案5月2日在第一次投票中没有获得通过，从而导致目前的802.11n厂商Airgo对已经出货的“pre-802.11n”（标准前的）产品提出了批评。\n　　据eweek.com网站报道，虽然802.11n工作组在今年1月份对这个标准草案达成了非正式的妥协，但是，在5月2日40天的信函投票期结束时，投票结果没有达到75%的正式批准802.11n1.0标准的法定票数。只有46%的成员投票批准这个标准。\n　　向下兼容的802.11n标准旨在逐步替换目前使用的Wi-Fi标准。802.11n标准的理论上的数据吞吐量可达到大约每秒300MB，远远高于目前802.11n标准提供的每秒54MB的速度。\n　　据802.11n工作组的成员称，802.11n标准草案在第一次投票中没有得到批准并不使人感到意外。技术草案一般在获得75%的绝大多数批准之前都要经过几个版本。据ExtremeTech网站今年4月份看到的一份正式的IEEE（国际电气电子工程师学会）标准路线图预测，802.11n标准信函投票将在2006年9月获得批准，而第一次赞助者投票在今年1月份进行。802.11n技术规范的最终批准预计将在2007年9月之后。\n　　然而，问题是几乎所有的家庭网络厂商都提前采取了行动。他们推测这个标准将以接近当前的这个版本的形式获得批准。\n　　所谓的“标准前的”产品应该是在信函投票和赞助者投票中批准了技术规范草案之后推出的产品。然而，Belkin、D-Link、Linksys和Netgear等厂商都宣布开始销售兼容“标准前的”802.11n产品。但是，在这个标准最终获得批准之前，哪一个厂商也不能销售兼容这个标准的产品。(c000)",
                        "doc_format": "txt"
                    }
                ];
                return [];
            }
        }
    },
    methods: {
        //初始并绘制  饼图
        initEchart() {
            const myChart = echarts.init(document.querySelector('.pie_container'));
            //计算 生成ecart 所需要的数据
            //统计每个区间的 文档个数
            let max, min;
            max = min = this.checkResult[0].similarity;
            this.checkResult.forEach(item => {
                max = Math.max(max, item.similarity);
                min = Math.min(min, item.similarity);
            });
            const num = this.checkResult.length <= 5 ? 1 : 5;
            const step = (max - min) / num;//分为 5个分区 单个分区的跨度
            const stepsObject = [];
            console.log('step', step);
            let end = parseFloat(Number(min + step).toFixed(2));
            let start = parseFloat(min.toFixed(2));
            const data = [];
            for (let i = 0; i < num; i++) {
                const name = `${start}-${end}`;
                const count = this.checkResult.filter(item => item.similarity <= end && item.similarity >= start).length;
                console.log('count', count);
                const newStart = start + step;
                const newEnd = end + step;
                //保留两位小数
                start = parseFloat(newStart.toFixed(2));
                end = parseFloat(newEnd.toFixed(2));
                if (count === 0) {
                    continue;
                }
                data.push({
                    value: count,
                    name
                });
                stepsObject.push({
                    start,
                    end,
                    name
                })
            };
            this.stepsObject = stepsObject;
            // console.log(data);
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}<br/>个数:{c} 占比({d}%)',
                    show: true,
                },
                toolbox: {
                    show: true,
                    feature: {
                        saveAsImage: {},
                    },

                    orient: 'vertical',
                    right: 0
                },
                title: {
                    text: '各个相似度区间占比',
                    left: 'center'
                },
                // legend: {
                //     orient: 'horizontal',
                //     left: 'center',
                //     data: data.map(item => item.name)
                // },
                series: [
                    {
                        name: '相似度占比',
                        type: 'pie',
                        top: 20,
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        // label: {
                        //     show: false,
                        //     position: 'center'
                        // },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: true
                        },
                        data
                    }
                ]
            };
            myChart.setOption(option);
            this.echartsIns = myChart;
            const resizeHandler = () => {
                //如果 echart 实例还在
                if (this.echartsIns)
                    this.echartsIns.resize();
                this.computeColumnWidth();
                console.log('resize');
            }
            //绑定 窗口 resize 事件 重新计算发小
            window.addEventListener('resize', throttlen_410(resizeHandler, 300))
            //绑定 点击事件
            this.echartsIns.on('click', 'series.pie', ({ dataIndex }) => {
                console.log(dataIndex);
                this.currentBetween = dataIndex;
                const { start, end } = this.stepsObject[dataIndex];
                this.showList = this.checkResult.filter(item => item.similarity <= end && item.similarity >= start);
            })
        },
        //根据位置生成 两个文档的html
        generateHtml() {
            console.log();
            const userPre = this.userDocInfo.self_message;
            const comPre = this.currentCompareData.doc_message;
            let userHtml = '';
            let comHtml = '';

            for (let i = 0; i < comPre.length;) {
                let start = -1;
                let end = -1;
                for (let j = 0; j < this.currentCompareData.num_of_doc_position.length; j++) {
                    const position = this.currentCompareData.num_of_doc_position[j];
                    if (position[0] === i) {
                        start = position[0];
                        end = position[1];
                    }
                }
                if (start !== -1) {
                    const text = comPre.slice(start, end);
                    comHtml += `<span style="color:#F56C6C">${text}</span>`
                    i = end + 1;
                }
                else {
                    // userPre+=user
                    comHtml += comPre[i];
                    i++;
                }

            }
            for (let i = 0; i < userPre.length;) {
                let start = -1;
                let end = -1;
                for (let j = 0; j < this.currentCompareData.num_of_self_position.length; j++) {
                    const position = this.currentCompareData.num_of_self_position[j];
                    if (position[0] === i) {
                        start = position[0];
                        end = position[1];
                    }
                }
                if (start !== -1) {
                    const text = userPre.slice(start, end);
                    userHtml += `<span style="color:#F56C6C">${text}</span>`
                    i = end + 1;
                }
                else {
                    userHtml += userPre[i];
                    i++;
                }

            }
            this.currentCompareData.htmlStr = comHtml;
            this.userDocHtmlStr = userHtml;
            this.showCompare();
            console.log('comHtml', comHtml);
            console.log('userHtml', this.userDocHtmlStr)
        },
        //范围变换
        betweenChange(value) {
            console.log(value);
            this.currentBetween = value;
            if (value == '-1') {
                this.showList = this.checkResult;
                return;
            }
            const { start, end } = this.stepsObject[value];
            this.showList = this.checkResult.filter(item => item.similarity <= end && item.similarity >= start);
        },
        //vsicon 点击事件 打开 比较界面
        async compareClick(item) {
            console.log(item);
            //实时读取 本地文档库中对应文档内容
            const content = await readDoc_410(item.docname);
            console.log(content);
            this.currentCompareData = item;
            this.currentCompareData.doc_message = content;
            // console.log(item);
            this.currentMode = 'compare';
            this.generateHtml();//计算 并打卡 对比界面
        },
        //展示 对比界面
        showCompare() {
            this.echartsIns.clear();//销毁实例 dispose
            this.echartsIns = null;
            remote.getCurrentWindow().maximize();//最大化
            // remote.getCurrentWindow().setFullScreen(true);
        },
        reChooseClick() {
            this.$emit('re-choose');
            console.log(666);
        },
        //退出对比界面
        exitCompare() {
            this.currentMode = 'show';
            setWindowSize_410(800, 800);
            remote.getCurrentWindow().restore();//恢复到之前的 大小
            remote.getCurrentWindow().center();// 窗口居中
            //页面更新 重新加载数据
            this.$nextTick(() => {
                this.initEchart();
            })
        },
        //计算列的宽度
        computeColumnWidth() {
            console.log('recompute');
            const { width } = getComputedStyle(document.querySelector('.el-table'));
            this.tableColumnWidth = Math.floor(width / 5) - 10;
        }
    },
    //元素绑定
    mounted() {
        console.log(this.checkResult);
        console.log(this.userDocInfo);
        this.initEchart();
        this.computeColumnWidth();

    },
    created() {

    }
};




//根实例
const App_410 = new Vue({
    name: 'DuplicateCheckSystem',
    el: '#main',
    data() {
        return {
            isGetResult: false,//是否 请求到了 结果
            msg: 666,
            loading: false,//加载动画
            checkResult: [],//查重结果
            //用户上传的文档信息
            userDocInfo: {
                docName: '',
                content: '',
            },
        };
    },
    components: {
        Entrance_410,
        Result_410,
    },
    methods: {
        //上传文件 到服务器
        async submit({ minSimilarity, checkAlgorithm, file: { name, type, raw } }) {
            this.loading = true;
            const formData = new FormData();
            formData.append('minSimilarity', minSimilarity);
            formData.append('checkAlgorithm', checkAlgorithm);
            formData.append('docType', type);
            formData.append('docName', name);
            formData.append('binary', raw);

            axios.post('http://127.0.0.1:5000/post', formData, {
                timeout: 60000
            })
                .then(({ data }) => {
                    console.log(data);
                    this.loading = false;
                    console.log(this.loading);
                    // if (data.length === 0) retutn this.$message.info('没有相似度超过阈值的文档');

                    this.checkResult = data.splice(1, data.length - 1);
                    showNotif_410('结果返回成功');
                    setWindowSize_410(800, 800);
                    this.userDocInfo.docName = name;
                    this.userDocInfo.self_message = data[0];
                    this.isGetResult = true;
                })
                .catch(err => {
                    console.log(err);
                    this.loading = false;
                    this.$refs.entrance.reChoose();
                    return showNotif_410('查重失败');
                })


            // let timer = setTimeout(() => {

            //     this.loading = false;
            //     console.log(this.loading);
            //     this.checkResult = res;

            //     showNotif_410('结果返回成功');
            //     setWindowSize_410(800, 800);
            //     clearTimeout(timer);
            //     timer = null;
            //     this.userDocInfo.docName = name;
            //     this.userDocInfo.content = 'name撒大苏打实打实撒大苏打实打实大苏打实打实的sdhadhasdasd';
            //     this.isGetResult = true;
            //     console.log(this.checkResult, this.isGetResult);
            // }, 500)

        },
        //重新进入入口页面
        reChoose() {
            this.isGetResult = false;
            this.$refs.entrance.reChoose();
        }

    },
    created() {
        // this.submit();
    }
});