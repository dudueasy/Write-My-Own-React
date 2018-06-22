/** @jsx h*/
// 这部分代码用于设定解析 jsx对象/react元素 的方式
// 参考 https://github.com/lcxfs1991/blog/issues/13
function h(type, props, ...children) {
    return {type,props,children}
} 

// 自定义一个渲染jsx元素的方法
function createElement(node){
    // 判断参数的类型
  // --如果参数是字符串, 那么我们创建一个文本节点.
    if(typeof node === 'string'){
        return document.createTextNode(node)
    }
  
     // --如果是HTML节点
  // ----首先根据节点的类型来创建一个HTML节点
  let element = document.createElement(node.type)
  
  // ----迭代地调用函数自身创建节点的子节点
  if(node.children){
      node.children.map(createElement)
      .forEach(element.appendChild.bind(element))
  }
  return element
}

// 自定义一个diff算法, 比较新旧虚拟DOM 是否有差异, 返回布尔值
// --首先进行数据类型的比较
// ----比较 新旧虚拟DOM 的类型 (JS数据类型)
// ----如果 原虚拟DOM 对象的数据类型为 string (原始类型), 那么直接将二者进行严格比较
// -- 然后比较虚拟DOM 对象的 .type属性
// ---- 如果 对象的.type一致, 那么比较 props 和 children
// -- 这里并没有比较 新旧节点的子节点, 如果新旧节点类型一致, 且不为String
//    那么接下来还需要对子节点递归处理.(在 updateElement 函数中)

function compare(oldNode, newNode){
    return typeof oldNode !== typeof newNode||
              typeof oldNode === "string" && oldNode !== newNode ||
        oldNode.type !== newNode.type
}

// 定义一个更新节点的方法
// --接收的参数为: 接收虚拟dom的父节点, 新的虚拟dom, 旧的虚拟dom, 子节点的下标(用于递归)
function updateElement(parent, newNode, oldNode, index = 0){
    // 如果没有旧的虚拟dom, 那么直接调用自定义的渲染方法 createElement将虚拟DOM渲染到 dom节点 parent 上
    if(!oldNode){
      parent.appendChild(
        createElement(newNode)
    )
  }
  // 如果接收到的新节点为空, 那么删除旧的 virtual dom 节点.
  else if(!newNode){
      parent.removeChild(
        parent.childNodes[index]
    )
  }
  // 使用自定义的 compare 方法 判断新旧节点是否有变更
  // --如果有变更, 就用新节点替换旧节点
  else if(compare(oldNode, newNode)){
    parent.replaceChild(
      createElement(newNode),
      parent.childNodes[0]
      )
    } else if(newNode.type){
      let newNodeLen = newNode.children.length
    let oldNodeLen = oldNode.children.length
    // 迭代处理 新旧虚拟dom上的子节点
    for(let i = 0; i< newNodeLen || i < oldNodeLen; i++){
        // 递归处理子节点
      updateElement(parent.childNodes[index], newNode.children[i], oldNode.children[i],i)
    }
  }
}


// 初始化, 定义一个节点作为虚拟DOM
const list = ( 
<ul class = "list">
    <li> Apple </li> 
    <li> Watermelon </li> 
</ul>
)
/* console.log(list) */

let root = document.getElementById('root')
root.appendChild(createElement(list))


// 使用自定义的虚拟DOM
const newList = ( 
<ul class = "list">
    <li> Apple </li> 
    <li> 
        <p> 这是一个嵌套元素 </p>
        <div>
        	<ul>
          	<li>这是一个双层嵌套元素</li>
  					<li>这是另一个双层嵌套元素</li>
          </ul>
        </div>
    </li> 
</ul>
)

// 定义按钮来触发virtual dom 的比较和渲染
let button = document.getElementById('reload')
button.onclick = ()=>{
    updateElement(root, newList, list)
}