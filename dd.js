

function Main(td, tr, minesNum) {

    this.td = td;         // 需要输入的参数,行和列，还有雷的数量
    this.tr = tr;
    this.minesNum = minesNum;

    this.allRight = false;  //右击标的小红旗是否全是雷，用来判断用户是否成功
    this.squares = [];     //存储所有方块的信息，例如存放的是雷还是数字
    this.tds = [];        // 存储创建的td表格单元
    this.remainingMines = minesNum;  //剩余地雷数量
    this.parsent = document.querySelector(".gameBox");// 需要用到的表格父级，因为创建好表格要插入到父级中
}


// 创建表格
Main.prototype.createTable = function () {

    var This = this;  //因为鼠标按下调用的应该是这个this，所以重新赋值在用

    var table = document.createElement("table");

    for (let i = 0; i < this.tr; i++) {

        var domTr = document.createElement("tr");

        this.tds[i] = [];   //创建个二维数组存放td

        for (let j = 0; j < this.td; j++) {

            var domTd = document.createElement("td");

            domTd.pos = [i, j];  //定义个属性数组把行和列传进去，方便下面对象取数据

            domTd.onmousedown = function () {
                This.play(event, this);
            }

            // if (this.squares[i][j].type == "mines") {

            //     domTd.className = "mines";  // 创建class名改变方格样式
            // }

            this.tds[i][j] = domTd;
            domTr.appendChild(domTd);

        }
        table.appendChild(domTr);
    }
    this.parsent.innerHTML = "";   //先情况上一次创建的表格，避免多次点击重建表格
    this.parsent.appendChild(table);
}

// 随机出现雷
Main.prototype.randomMines = function () {

    var square = new Array(this.tr * this.td);   //创建空数组，利用乱排序进行随机

    for (let i = 0; i < square.length; i++) {   // 先进行赋值

        square[i] = i;

    }
    square.sort(function () {
        return (0.5 - Math.random());
    });

    return (square.splice(0, this.minesNum));    //从0截取到雷的总数
}

// 玩游戏函数,参数是哪个事件和点击的Dom对象
Main.prototype.play = function (ev, obj) {

    var This = this;

    if (ev.which == 1) {               //判断为左键
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]]; //点击的几行几列的对象td

        // console.log(curSquare);        //返回的是对象

        var num = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

        if (curSquare.type == "number") {       //点击到的是数字

            obj.innerHTML = curSquare.value;     // 把数值写入到DOM对象中
            obj.className = num[curSquare.value];

            if (curSquare.value == 0) {       //如果点击到0就会显示周围为0的一片空白

                obj.innerHTML = "";  //点击到0不显示出数字

                
                function getAllZero(square) {

                    var around = This.getAround(square); //找到周围n个格子的行列坐标

                    for (let i = 0; i < around.length; i++) {

                        var x = around[i][0];
                        var y = around[i][1];

                        This.tds[x][y].className = num[This.squares[x][y].value]; //为了显示不同数字不一样的样式

                        // This.tds[x][y] = num[]

                        if (This.squares[x][y].value == 0) { //周围的方格中查找到0

                            // 查找之前先判断是否查找过，不要重复查找
                            // 第一次为undefined为false，可以进入函数
                            if (!This.tds[x][y].check) {

                                // console.log(This.tds[x][y].check);

                                This.tds[x][y].check = true;  //查找过就为true，下次就不会进来判断了

                                getAllZero(This.squares[x][y]); //没有找过就继续递归查找周围的

                            }

                        }
                        else {
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }

                    }
                }
                getAllZero(curSquare);
            }

        }
        else {
            This.gameOver(obj);
        }
    }
    if (ev.which == 3) {         //判断为右键

        // 首先判断有没有class，并且class是不是红旗，有，是红旗就返回
        // 因为右键点击时没有任何class，有不是红旗无法点击，也返回
        if (obj.className && obj.className != "flag") {
            return;
        }

        // 是红旗在点击就去掉，不是就加上红旗

        obj.className = (obj.className == "flag" ? "" : "flag");

        // 判断小红旗后面是否都是雷
        if (this.squares[obj.pos[0]][obj.pos[1]].type == "mines") {

            this.allRight = true;

        }
        else {
            this.allRight = false; //有一个不是雷就不满足，赋值false
        }

        // 点击的有红旗就减，取消红旗就加1
        if (obj.className == "flag") {

            this.minesNum.innerHTML = (--this.remainingMines);
        }
        else {
            this.minesNum.innerHTML = (++this.remainingMines);
        }

        if (this.remainingMines == 0) {

            // 剩余的雷的数量为0，判断是否成功
            if (this.allRight) {
                // 说明红旗背后都是雷
                alert("啊哈，成功了");
            }
            else {
                alert("哎呀，失败了");

                this.gameOver();

            }
        }

    }
}

// 点到地雷，游戏结束
Main.prototype.gameOver = function (clickTd) {

    /* 
        1.点中雷后显示所有的雷
        2.关闭点击事件
        3.点击的雷的背景
    */
    // 查找存储对象的数组数据
    for (let i = 0; i < this.tr; i++) {
        for (let j = 0; j < this.td; j++) {

            if (this.squares[i][j].type == "mines") {
                this.tds[i][j].className = "mines";
            }
            this.tds[i][j].onmousedown = null;

        }

    }
    clickTd.className = "click";

}


// 搜索周围方块，在数字计算和检验0时用到,参数是二维数组
Main.prototype.getAround = function (square) {

    var x = square.x;
    var y = square.y;
    var res = [];    //把找到的周围格子坐标放进去返回

    
    for (let i = x - 1; i <= x + 1; i++) {

        for (let j = y - 1; j <= y + 1; j++) {
            // 以下情况不需要，保存坐标
            if (
                i < 0 ||
                i > this.td - 1 ||   //坐标从0开始，this.td是从1开始，所以大于长度-1就过界
                j < 0 ||
                j > this.tr - 1 ||
                (i == x && j == y)   //等于自己不需要，找的是周围的
            ) {
                continue;
            }

            res.push([j, i]);   //以行列的形式存储

        }

    }
    return res;
}

// 更新数字值，查找周围有几个雷数字就为几，只更新雷周围的数字
Main.prototype.updateNum = function () {

    var This = this;
    // 遍历所有表格，查找对象属性为雷的
    for (let i = 0; i < this.tr; i++) {
        for (let j = 0; j < this.td; j++) {

            if (this.squares[i][j].type == "number") { continue; }

            var num = this.getAround(this.squares[i][j]);

            num.forEach(function (val, key) {

               
                This.squares[num[key][0]][num[key][1]].value += 1; // 雷周围有这个数字就加1

            });
        }
    }
}


// 创建初始化函数
Main.prototype.init = function () {

    var rn = this.randomMines(); // 找到有雷的所有索引,是个数组

    var n = 0;

    for (let i = 0; i < this.tr; i++) {

        this.squares[i] = [];

        for (let j = 0; j < this.td; j++) {

            if (rn.indexOf(n++) != -1) {         // 查找所有单元格，存在就说明有雷

                this.squares[i][j] = { type: "mines", x: j, y: i };
            }
            else {
                this.squares[i][j] = { type: "number", x: j, y: i, value: 0 }
            }

        }

    }
    this.parsent.oncontextmenu = function () {       //此处是为了关掉右击出现菜单的现象
        return false;
    }
    this.updateNum();
    this.createTable();

    this.minesNum = document.querySelector(".minesNum");
    this.minesNum.innerHTML = this.remainingMines;

}

var btns = document.querySelectorAll(".btns button");

var main = null; //用来存储的实例对象

var prebtn = 0; //存储上一次按钮状态

var arr = [[10, 10, 10], [20, 20, 60], [30, 30, 99]];//不同状态的行列和雷数

// 减1是因为最后一个按钮不是级别选择
//此处有闭包现象，用let时存储的都是0，1，2，3闭包，但是用var i会变成4，是length的值
for (let i = 0; i < btns.length - 1; i++) {

    btns[i].onclick = function () {

        btns[prebtn].className = "";   // 先清空上一个按钮的样式

        this.className = "active";    // 在给现在的点中按钮加个样式

        main = new Main(...arr[i]);  //...是ES6的扩展运算符，就是（10，10，10）

        main.init();

        prebtn = i;
    }

}

// 一开始就调用，先显示第一个
btns[0].onclick();

btns[3].onclick = function () {  //最后一个按钮重新开始
    window.location.reload();
    main.init();
}


