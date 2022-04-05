/*
 * (c) RM//Kesper
 * MIT License
 */
class ToolTip {
	css = "bg-black/80 dark:bg-white/90 text-white dark:text-black text-xs px-2 py-1 rounded-sm shadow truncate"
	add(css = this.css) {
		this.css = css
		let self = this
		let html = document.querySelector("html")
		let htmlCls = html.getAttribute("class")
		let tipadd = "tooltip-add"
		if(html && (!htmlCls || (htmlCls && htmlCls.indexOf(tipadd)<0)) ) {
			(new MutationObserver(function(mutations) {
				let mutate = false;
				for(let mutation of mutations) 
					if(mutation.oldValue !== mutation.target.textContent) {
						mutate = true;
						break;
					}
				if (mutate) (new ToolTip()).add()
			})).observe(document.body, { characterDataOldValue: true, subtree: true, childList: true, characterData: true })
			if(!htmlCls) html.setAttribute("class", tipadd)
			else html.setAttribute("class", htmlCls + ' ' + tipadd)
		}
		let ts = document.querySelectorAll('[data-tip]')
		for(let t of ts) {
			if(!t.classList.contains(tipadd)) {
				t.classList.add(tipadd)
				t.setAttribute("data-tip-id", "_" + (new Date()).getTime() + Math.floor(Math.random()*9999))
				t.title=""
				t.addEventListener("mouseenter", function(){ self.create.call(self, event) }, false )
				t.addEventListener("touchstart", function(){ self.create.call(self, event) }, false )
				t.addEventListener("mouseleave", self.rm)
				t.addEventListener("touchend", self.rm)
			}
		}
	}
	rm(event) {
		let e = event.target
		if(document.getElementById(e.getAttribute("data-tip-id"))) {
			document.getElementById(e.getAttribute("data-tip-id")).remove()
		}
	}
	create(event) {
		let _css = this.css
		let e = event.target
		let attr = e.getAttribute("data-tip")
		if(attr.length===0) return
		let txt = attr.charAt(0) === "#" ? document.getElementById(attr.substr(1))?.innerHTML : attr
		let id = e.getAttribute("data-tip-id")
		if(document.getElementById(id)) {
			document.getElementById(id).remove()
		}
		if(e.getAttribute("data-tip-css")) _css = e.getAttribute("data-tip-css")
		let pos = e.getAttribute("data-tip-pos") ?? "top"
		let off = parseInt( e.getAttribute("data-tip-offset") ?? "10" )
		let dur = parseInt( e.getAttribute("data-tip-timeout") ?? "150" )
		let x = e.getBoundingClientRect().x
		let y = e.getBoundingClientRect().y
		let w = e.getBoundingClientRect().width
		let h = e.getBoundingClientRect().height
		let n = document.createElement("DIV")
		document.querySelector("HTML").appendChild(n)
		n.setAttribute("id", id)
		if(txt.indexOf("class")<0 && txt.indexOf("style")<0) {
			n.setAttribute("class", _css + (txt.indexOf("<")<0 ? ' flex items-center ' : ''))
		}
		n.classList.add("fixed")
		n.classList.add("opacity-0")
		n.classList.add("transition-opacity")
		n.innerHTML = txt
		n.style.setProperty("top", 0 + "px")
		n.style.setProperty("left", 0 + "px")
		n.style.setProperty("width", "fit-content")
		let nw = n.getBoundingClientRect().width
		let nh = n.getBoundingClientRect().height
		let _x = x
		let _y = y
		if(pos === "top") {
			_x = x - (nw - w) / 2
			if( _x <= 0) _x = off
			if( _x+nw >= window.innerWidth) _x = window.innerWidth - 10 - nw
			_y = y - nh - off
			if( _y <= 0) _y = y+h+off
		}
		else if(pos === "bottom") {
			_x = x - (nw - w) / 2
			if( _x <= 0) _x = off
			if( _x+nw+off >= window.innerWidth) _x = window.innerWidth - 10 - nw
			_y = y+h+off
			if( _y+nh+off > window.innerHeight) _y = y - nh - off
		}
		else if(pos === "left") {
			_x = x - nw - off
			if( _x <= 0) _x = x+w+off
			_y = y - (nh - h) / 2
			if( _y <= 0) _y = off
			if( _y+nh+off > window.innerHeight) _y = window.innerHeight - 10 - nh
		}
		else if(pos === "right") {
			_x = x+w+off
			if( _x+nw+off >= window.innerWidth) _x = x - nw - off
			_y = y - (nh - h) / 2
			if( _y <= 0) _y = off
			if( _y+nh+off > window.innerHeight) _y = window.innerHeight - 10 - nh
		}
		n.style.setProperty("top", _y + "px")
		n.style.setProperty("left", _x + "px")
		setTimeout( () => {
			if(document.getElementById(id)) document.getElementById(id).classList.remove("opacity-0")
		}, dur)
	}
}
