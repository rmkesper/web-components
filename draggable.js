/**
	 * (c) RM//Kesper
	 * MIT License
	 * - add class "draggable" to element and start via "(new TransformDraggable()).add()"
	 * - parent element is used for drag limitations
	 * - lock orientation bby adding "data-drag-x" or "data-drag-y" to element
	 */
	class TransformDraggable {
		dragActive = false
		dragEl = null
		dragElPrnt = null
		add () {
			let self = this
			document.body.classList.add("drag-added")
			document.addEventListener("mousemove", function() { self.drag.call(self, event) } )
			document.addEventListener("touchmove", function() { self.drag.call(self, event) } )
			document.addEventListener("mouseup", function() { self.dragEnd.call(self) } )
			document.addEventListener("touchend", function() { self.dragEnd.call(self) } )
			document.addEventListener("touchstart", () => {
				document.body.firstElementChild.classList.remove("overflow-y-auto")
				document.body.firstElementChild.classList.remove("overflow-x-hidden")
				if(!document.body.firstElementChild.classList.contains("overflow-hidden"))
				document.body.firstElementChild.classList.add("overflow-hidden")
			});
			document.addEventListener("touchend", () => {
				document.body.firstElementChild.classList.remove("overflow-hidden")
				if(!document.body.firstElementChild.classList.contains("overflow-y-auto"))
				document.body.firstElementChild.classList.add("overflow-y-auto")
				if(!document.body.firstElementChild.classList.contains("overflow-x-hidden"))
				document.body.firstElementChild.classList.add("overflow-x-hidden")
			});
			(new MutationObserver(function(mutations) {
				let mutate = false;
				for(let mutation of mutations) 
					if(mutation.oldValue !== mutation.target.textContent) {
						mutate = true;
						break;
					}
				if (mutate) self.addDrag();
			})).observe(document.body, { characterDataOldValue: true, subtree: true, childList: true, characterData: true })
		}
		addDrag() {
			let self = this
			for(let e of document.querySelectorAll('.draggable')) {
				if(!e.classList.contains("draggable-added")) {
					e.classList.add("draggable-added")
					if(!e.classList.contains("transform")) e.classList.add("transform")
					e.addEventListener("mousedown", function() { self.dragStart.call(self, event, e, e.parentElement) }, false)
					e.addEventListener("touchstart", function() { self.dragStart.call(self, event, e, e.parentElement) }, false)
				}
			}
		}
		dragStart(event, el, prnt){
			if(!el.classList.contains("draggable")) return
			this.dragActive = true
			this.dragEl = el
			this.dragElPrnt = prnt
			let startX = !!event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
			let startY = !!event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
			let _startX = this.dragEl.style.getPropertyValue("--tw-translate-x") ?? "0"
			let _startY = this.dragEl.style.getPropertyValue("--tw-translate-y") ?? "0"
			if(_startX.indexOf("em")>0) _startX = (parseInt(_startX) * 16).toString()
			if(_startY.indexOf("em")>0) _startY = (parseInt(_startY) * 16).toString()
			_startX = _startX === "" ? "0" : _startX
			_startY = _startY === "" ? "0" : _startY
			this.dragEl.setAttribute("data-drag-start-x", parseInt(_startX))
			this.dragEl.setAttribute("data-drag-start-y", parseInt(_startY))
			this.dragEl.setAttribute("data-drag-event-x", startX)
			this.dragEl.setAttribute("data-drag-event-y", startY)
		}
		drag(event){
			if(!el.classList.contains("draggable")) return
			if(!this.dragActive || !this.dragEl || !this.dragElPrnt) return
			let elRect = this.dragEl.getBoundingClientRect()
			let pRect = this.dragElPrnt.getBoundingClientRect()
			let allowX = !!this.dragEl.getAttribute("data-drag-x")
			let allowY = !!this.dragEl.getAttribute("data-drag-y")
			if(!allowX && !allowY) allowX = allowY = true
			let dragStartX = parseInt(this.dragEl.getAttribute("data-drag-start-x"))
			let dragStartY = parseInt(this.dragEl.getAttribute("data-drag-start-y"))
			let dragEventX = parseInt(this.dragEl.getAttribute("data-drag-event-x"))
			let dragEventY = parseInt(this.dragEl.getAttribute("data-drag-event-y"))
			let thisDragX = !!event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
			let thisDragY = !!event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
			let posX = thisDragX - dragEventX + dragStartX
			let posY = thisDragY - dragEventY + dragStartY
			let mar = 10 // minimum margin for max position definitions
			let off = 15 // set position outside the minimum margin so that we can still drag and not exceed the limitations
			// move x and y
			for(let i of [0,1]) {
				let or = i === 0 ? "x" : "y"
				let res = i === 0 ? "width" : "height"
				let pos = i === 0 ? posX : posY
				let allow = i === 0 ? allowX : allowY
				if(allow) {
					if( (elRect[or]+elRect[res] < pRect[or]+pRect[res]-mar && elRect[or] > pRect[or]+mar 
						&& this.dragEl.getAttribute("data-drag-min-"+or) === null 
						&& this.dragEl.getAttribute("data-drag-max-"+or) === null) ) {
						this.dragEl.style.setProperty("--tw-translate-"+or, pos + 'px')
						if(this.dragEl.id) this[this.dragEl.id+or.toUpperCase()] = pos
					} 
					else if ( elRect[or] <= pRect[or]+mar && this.dragEl.getAttribute("data-drag-min-"+or) === null) {
						if(this.dragEl.getAttribute("data-drag-min-"+or) === null) {
							if(this.dragEl.getAttribute("data-drag-init-min-"+or) === null)
								this.dragEl.setAttribute("data-drag-init-min-"+or, pos)
							this.dragEl.setAttribute("data-drag-min-"+or, pos)
							let max = this.dragEl.getAttribute("data-drag-min-"+or)
							this.dragEl.style.setProperty("--tw-translate-"+or, (parseInt(max)+off) + 'px')
							if(this.dragEl.id) this[this.dragEl.id+or.toUpperCase()] = (parseInt(max)+off)
						}
					}
					else if( this.dragEl.getAttribute("data-drag-min-"+or) !== null ) {
						if(pos-parseInt(this.dragEl.getAttribute("data-drag-min-"+or)) > 0) {
							this.dragEl.style.setProperty("--tw-translate-"+or, pos + 'px')
							if(this.dragEl.id) this[this.dragEl.id+or.toUpperCase()] = pos
							this.dragEl.removeAttribute("data-drag-min-"+or)
						} else if(elRect[or] <= pRect[or]+mar) {
							let max = this.dragEl.getAttribute("data-drag-init-min-"+or)
							this.dragEl.style.setProperty("--tw-translate-"+or, (parseInt(max)+off) + 'px')
							if(this.dragEl.id) this[this.dragEl.id+or.toUpperCase()] = (parseInt(max)+off)
						}
					}
					else if ( elRect[or]+elRect[res] >= pRect[or]+pRect[res]-mar && this.dragEl.getAttribute("data-drag-max-"+or) === null) {
						if(this.dragEl.getAttribute("data-drag-max-"+or) === null) {
							if(this.dragEl.getAttribute("data-drag-init-max-"+or) === null)
								this.dragEl.setAttribute("data-drag-init-max-"+or, pos)
							this.dragEl.setAttribute("data-drag-max-"+or, pos)
							let max = this.dragEl.getAttribute("data-drag-max-"+or)
							this.dragEl.style.setProperty("--tw-translate-"+or, (parseInt(max)-off) + 'px')
							if(this.dragEl.id) this[this.dragEl.id+or.toUpperCase()] = (parseInt(max)-off)
						}
					}
					else if( this.dragEl.getAttribute("data-drag-max-"+or) !== null ) {
						if(pos-parseInt(this.dragEl.getAttribute("data-drag-max-"+or)) < 0) {
							this.dragEl.style.setProperty("--tw-translate-"+or, pos + 'px')
							if(this.dragEl.id) this[this.dragEl.id+or.toUpperCase()] = pos
							this.dragEl.removeAttribute("data-drag-max-"+or)
						} else if(elRect[or]+elRect[res] >= pRect[or]+pRect[res]-mar) {
							let max = this.dragEl.getAttribute("data-drag-init-max-"+or)
							this.dragEl.style.setProperty("--tw-translate-"+or, (parseInt(max)-off) + 'px')
							if(this.dragEl.id) this[this.dragEl.id+or.toUpperCase()] = (parseInt(max)-off)
						}
					}
				}
			}
			let rangeX = pRect.width - elRect.width - off*2
			let rangeY = pRect.height - elRect.height - off*2
			let crntX = elRect.x / rangeX
			let crntY = elRect.y / rangeY
			let prcX = Math.round(crntX * 100)
			let prcY = Math.round(crntY * 100)
			if(prcX < 4) prcX = 0
			if(prcX > 96) prcX = 100
			if(prcY < 4) prcY = 0
			if(prcY > 96) prcY = 100
			localStorage.setItem("DRAG_X%", prcX)
			localStorage.setItem("DRAG_Y%", prcY)
		}
		dragEnd(){
			if(this.dragEl) {
				this.dragEl.removeAttribute("data-drag-start-x")
				this.dragEl.removeAttribute("data-drag-start-y")
				this.dragEl.removeAttribute("data-drag-event-x")
				this.dragEl.removeAttribute("data-drag-event-y")
			}
			this.dragActive = false
			this.dragEl = null
			this.dragElPrnt = null
		}
	}
