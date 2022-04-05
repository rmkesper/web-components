/*
 * (c) RM//Kesper
 * MIT License
 */
class RippleEffect {
	rippleName = 'ripple' // provide additional properties like "ripple[<color>|<duration>|<opacityStart>|<scaleRippleEnd>]" in class name
	rippleNameDisableParentEffect = 'unrip' // if this class is contained in a child element, the parent does not ripple
	rippleCSSName = 'ani_expand'
	rippleStyleHolder = 'rpl-frame'
	rippleAnimationsName = 'bg_ani_rpl';
	rippleCol = 'black'
	rippleScaleStart = 0
	rippleScaleEnd = 3
	rippleOpacityStart = 0.2
	rippleOpacityEnd = 0
	rippleAniDuration = 1 //in s!
	add() {
		let self = this;
		let _ = new RippleEffect;
		let html = document.querySelector("html")
		let htmlCls = html.getAttribute("class")
		let rpladd = "rpleff-add"
		if(html && (!htmlCls || (htmlCls && htmlCls.indexOf(rpladd)<0)) ) {
			(new MutationObserver(function(mutations) {
				let mutate = false;
				for(let mutation of mutations) 
					if(mutation.oldValue !== mutation.target.textContent) {
						mutate = true;
						break;
					}
				if (mutate) (new RippleEffect()).add()
			})).observe(document.body, { characterDataOldValue: true, subtree: true, childList: true, characterData: true })
			if(!htmlCls) html.setAttribute("class", rpladd)
			else html.setAttribute("class", htmlCls + ' ' + rpladd)
			
		}
		// update the dom style with the ripple keyframe & css pseudo element
		if(!document.getElementById(_.rippleStyleHolder)){
			let head = document.head || document.getElementsByTagName("head")[0]
			let style = document.createElement("style")
			let css = ''
			css += `@keyframes ${_.rippleAnimationsName}
			{0% {
			opacity:var(--rpl-opacity-start);
			transform: translate3d(0, 0, 0);
			background-size: calc(var(--rpl-max) * var(--rpl-scl-start)) calc(var(--rpl-max) * var(--rpl-scl-start));
			background-position-x: calc(var(--rpl-dx) - var(--rpl-max) * var(--rpl-scl-start) / 2);
			background-position-y: calc(var(--rpl-dy) - var(--rpl-max) * var(--rpl-scl-start) / 2);
			}
			100% {
			opacity:var(--rpl-opacity-end);
			transform: translate3d(0, 0, 0);
			background-size: calc(var(--rpl-max) * var(--rpl-scl-end)) calc(var(--rpl-max) * var(--rpl-scl-end));
			background-position-x: calc(var(--rpl-dx) - var(--rpl-max) * var(--rpl-scl-end) / 2);
			background-position-y: calc(var(--rpl-dy) - var(--rpl-max) * var(--rpl-scl-end) / 2);
			}}
			.${_.rippleCSSName}::before{
			content: "";
			z-index: -1;
			position: absolute;
			transform-origin: center;
			backface-visibility: hidden;
			transform: translate3d(0, 0, 0);
			background-repeat: no-repeat;
			background-color: transparent;
			width: 100%;
			height: 100%;
			top: calc(50% - var(--rpl-top));
			left: calc(50% - var(--rpl-left));
			background-size: calc(var(--rpl-max) * var(--rpl-scl-start)) calc(var(--rpl-max) * var(--rpl-scl-start));
			background-position-x: calc(var(--rpl-dx) - var(--rpl-max) * var(--rpl-scl-start) / 2);
			background-position-y: calc(var(--rpl-dy) - var(--rpl-max) * var(--rpl-scl-start) / 2);
			border-top-left-radius:var(--rpl-border-tl-radius);
			border-top-right-radius:var(--rpl-border-tr-radius);
			border-bottom-left-radius:var(--rpl-border-bl-radius);
			border-bottom-right-radius:var(--rpl-border-br-radius);
			background-image: var(--rpl-url);
			animation: ${_.rippleAnimationsName} var(--rpl-ani-duration) var(--rpl-ani-state) linear forwards;
			}`
			head.appendChild(style)
			style.setAttribute("id", _.rippleStyleHolder);
			style.appendChild(document.createTextNode(css));
		}
		// catch the ripple element with a wildcard filter (in case some colors are provided, working with tailwind too...)
		document.querySelectorAll(`[class*='${_.rippleName}']`).forEach( itm => {
			if(!itm.classList.contains(rpladd)) {
				// call the .add() method on mousedown / touchstart, run the event on mouseup / touchend
				if(document['addEventListener']) {
					itm.addEventListener(`mousedown`, self.create);
					itm.addEventListener(`touchstart`, self.create);
					itm.addEventListener(`mouseup`, self.end);
					itm.addEventListener(`touchend`, self.end);
				} else {
					(itm).attachEvent(`onmousedown`, self.create);
					(itm).attachEvent(`ontouchstart`, self.create);
					(itm).attachEvent(`onmouseup`, self.end);
					(itm).attachEvent(`ontouchend`, self.end);
				}
				itm.classList.add(rpladd)
			}
		})
	}
	getP(p) {
		let _ = new RippleEffect;
		function getCls(e){
				let c = e.className ?? ""
				return c.baseVal ?? c
		}
		while( getCls(p).indexOf(_.rippleName)<0 && p.tagName.toLowerCase() !== "body" ) {
			if(getCls(p).indexOf(_.rippleNameDisableParentEffect)>=0) return
			p = p.parentElement
		}
		return p
	}
	end(event) {
		let _ = new RippleEffect;
		let p = _.getP(event.target)
		if(p.className.indexOf(_.rippleName)<0) return;
		let id = p.getAttribute("data-rpl-id")
		let rippleDuration = parseInt(p.style.getPropertyValue('--rpl-ani-duration'))
		p.setAttribute("data-rpl-end", "true")
		if(p.style.getPropertyValue('--rpl-ani-state') === "running") return
		p.style.setProperty('--rpl-ani-state', 'running')
		setTimeout( () => {
			if(document.getElementById(id)) 
				document.getElementById(id).remove()
		}, rippleDuration * 1000 / 2 )
	}
	create(event){
		let _ = new RippleEffect;
		let p = _.getP(event.target)
		if(p.className.indexOf(_.rippleName)<0) return;
		let id = "_" + (new Date()).getTime() + Math.floor(Math.random()*9999)
		// clear last animation
		p.style.setProperty('--rpl-scl-start', 0)
		// check if selected ripple parent is at not the 'static' position value
		if(window.getComputedStyle(p).getPropertyValue('position').trim().toLocaleLowerCase() === 'static')
			p.style.setProperty('position', 'relative')
		let rippleCol = _.rippleCol;
		let opacityStart = _.rippleOpacityStart;
		let rippleDuration = _.rippleAniDuration;
		let rippleScaleEnd = _.rippleScaleEnd;
		// check if attributes were passed to current button
		for(let cls of p.className.split(" ")) {
			if(cls.indexOf(_.rippleName)>=0){
				// check if an array is provided
				if(cls.split('[').length>1){
					// parse the array by split (prevent crash by wrong namings)
					let clsStr = cls.split(_.rippleName+'[')[1].split(']').join('')	
					let attrs = ( clsStr ).split('|')
					rippleCol = attrs[0].trim();
					rippleDuration = attrs.length>1 ? (attrs[1].trim() !== 'null' ? attrs[1].trim() : rippleDuration) : rippleDuration
					opacityStart = attrs.length>2 ? (attrs[2].trim() !== 'null' ? attrs[2].trim() : opacityStart) : opacityStart
					rippleScaleEnd = attrs.length>3 ? (attrs[3].trim() !== 'null' ? attrs[3].trim() : rippleScaleEnd) : rippleScaleEnd
					break;
				}
			}
		}
		// prepare the bg svg element
		let dataURL = 'data:image/svg+xml;base64,' +
			btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">` +
				`<path fill="${rippleCol}" d="M10,5.5C10,7.9853,7.9853,10,5.5,10S1,7.9853,1,5.5S3.0147,1,5.5,1S10,3.0147,10,5.5z"/>` +
				`</svg>`)
		let clientX = event.clientX ?? event.changedTouches[0].clientX
		let clientY = event.clientY ?? event.changedTouches[0].clientY
		let prgt = p.getBoundingClientRect();
		let w = prgt.width;
		let h = prgt.height;
		let dx = clientX - prgt.x
		let dy = clientY - prgt.y
		let max = Math.max(w, h) * 2.5
		p.setAttribute("data-rpl-id", id)
		p.setAttribute("data-rpl-end", "false")
		p.style.setProperty('--rpl-border-tl-radius', window.getComputedStyle(p).borderTopLeftRadius)
		p.style.setProperty('--rpl-border-tr-radius', window.getComputedStyle(p).borderTopRightRadius)
		p.style.setProperty('--rpl-border-bl-radius', window.getComputedStyle(p).borderBottomLeftRadius)
		p.style.setProperty('--rpl-border-br-radius', window.getComputedStyle(p).borderBottomRightRadius)
		p.style.setProperty('--rpl-opacity-start', opacityStart)
		p.style.setProperty('--rpl-opacity-end', _.rippleOpacityEnd)
		p.style.setProperty('--rpl-ani-duration', `${rippleDuration}s`)
		p.style.setProperty('--rpl-url', `url(${dataURL}`)
		p.style.setProperty('--rpl-dx', `${dx}px`)
		p.style.setProperty('--rpl-dy', `${dy}px`)
		p.style.setProperty('--rpl-max', `${max}px`)
		p.style.setProperty('--rpl-scl-start', _.rippleScaleStart)
		p.style.setProperty('--rpl-scl-end', rippleScaleEnd)
		p.style.setProperty('--rpl-ani-state', 'running')
		p.style.setProperty('--rpl-top', `${h/2}px`)
		p.style.setProperty('--rpl-left', `${w/2}px`)
		// now insert an element at first position into parent and append the ripple css to it
		let n = document.createElement("SPAN")
		if(p.firstElementChild){
			p.insertBefore(n, p.firstElementChild);
		} else p.appendChild(n)
		n.setAttribute("class", _.rippleCSSName)
		n.setAttribute("id", id)
		// detect if we did not yet receive the end trigger of the animation, then pause ani
		setTimeout( () => {
			if(p.getAttribute("data-rpl-end") === "false") {
				p.style.setProperty('--rpl-ani-state', 'paused')
			}
		}, rippleDuration * 1000 / 2)
		// define the ripple end size and check if we can remove the ripple (end received)
		setTimeout( () => {
			p.style.setProperty('--rpl-scl-start', 0)
			if((p.getAttribute("data-rpl-end") === "true")) {
				n.remove()
			}
		}, rippleDuration * 1000 )
	}
}
