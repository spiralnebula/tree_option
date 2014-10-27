define({

	define : {
		allow   : "*",
		require : [
			"morph",
			"event_master",
			"transistor"
		],
	},

	make : function ( define ) {
		console.log( this.library )
		var tree_option_body, event_circle
		
		tree_option_body = this.library.transistor.make(
			this.define_body( define )
		)

		event_circle = this.library.event_master.make({
			events : this.define_event({
				body : tree_option_body,
				with : define.with
			}),
			state  : this.define_state({
				body : tree_option_body,
				with : define.with 
			})
		})

		event_circle.add_listener(
			this.define_listener( define )
		)

		return this.define_interface({
			body         : tree_option_body,
			event_master : event_circle
		})
	},

	define_interface : function ( define ) { 
		return {
			body      : define.body.body,
			append    : define.body.append,
			get_state : function () { 
				return define.event_master.get_state()
			},
			reset     : function () {
				define.event_master.stage_event({
					called : "reset",
					as     : function ( state ) { 
						return { 
							event : { 
								target : define.body.body
							},
							state : state
						}
					}
				})
			}
		}
	},

	define_state : function ( define ) {
		return {
			body   : {
				tree   : define.body.get("tree"),
				result : define.body.get("result")
			},
			chosen : {
				node   : false,
				submit : define.with.submit
			},
			value  : { 
				path : "",
				text : "",
			}
		}
	},

	define_event : function ( define ) { 
		return [
			{
				called : "reset"
			},
			{ 
				called       : "tree option result button click",
				that_happens : [
					{ 
						on : define.body.body,
						is : [ "click" ]
					}
				],
				only_if : function ( heard ) {
					return ( heard.event.target.getAttribute( "data-tree-submit" ) )
				}
			},
			{
				called       : "tree option button click",
				that_happens : [
					{
						on   : define.body.body,
						is   : [ "click" ],
					}
				],
				only_if      : function ( heard ) {
					return ( 
						heard.event.target.getAttribute("data-option") || 
						heard.event.target.parentElement.getAttribute( "data-tree-option" )
					)
				}
			},
			{
				called       : "tree option branch click",
				that_happens : [
					{
						on   : define.body.body,
						is   : [ "click" ],
					}
				],
				only_if      : function ( heard ) {
					return ( 
						heard.event.target.getAttribute("data-branch") || 
						heard.event.target.parentElement.getAttribute( "data-branch" )
					)
				}
			}
		]
	},

	define_listener : function ( define ) {
		var self = this 
		return [
			{ 
				for       : "reset",
				that_does : function ( heard ) {

					var branch_node, button_node, closed_nodes, option_state

					option_state = heard.state
					if ( heard.state.chosen.node !== false ) { 
						branch_node               = heard.state.chosen.node
						button_node               = branch_node.nextSibling
						heard.state.value         = { 

						}
						heard.state.chosen.node   = false
						button_node.style.display = "none"
						branch_node.setAttribute("class", define.class_name.branch_text_option_wrap )
						branch_node.firstChild.setAttribute("class", define.class_name.branch_text_option )
					}

					closed_nodes = self.library.morph.index_loop({
						subject : self.get_node_of_every_open_branch({
							tree : heard.state.body.tree.body.children
						}),
						else_do : function ( loop ) { 
							loop.indexed.previousSibling.firstChild.textContent = "-"
							loop.indexed.style.display              = "none"
							loop.indexed.setAttribute("data-state", "closed")
							return loop.into.concat( loop.indexed )
						}
					})

					option_state.body.result.get("result name").body.textContent = "Nothing"
					option_state.body.result.get("result path").body.textContent = ""

					return heard
				}
			},
			{ 
				for       : "tree option result button click",
				that_does : function ( heard ) {

					var option_state, name

					name         = heard.event.target.getAttribute("data-name")
					option_state = heard.state
					option_state.chosen.submit.call({}, {
						in_context   : heard.event.target.getAttribute("data-tree-submit"),
						option_state : option_state,
						state        : heard.state,
						event        : heard.event
					})

					return heard
				}
			},
			{
				for       : "tree option button click",
				that_does : function ( heard ) {

					var node, option_state, name

					node         = ( heard.event.target.getAttribute("data-tree-option") ? 
						heard.event.target : 
						heard.event.target.parentElement
					)
					name         = node.getAttribute("data-name")
					option_state = heard.state

					if ( option_state.chosen.node !== false ) {

						option_state.chosen.node.setAttribute("class", define.class_name.branch_text_option_wrap )
						option_state.chosen.node.children[0].setAttribute("class", define.class_name.branch_text_option )
						option_state.chosen.node.parentElement.children[1].style.display = "none"
					}

					if ( node !== option_state.chosen.node ) { 

						node.setAttribute("class", define.class_name.branch_text_option_wrap_active)
						node.children[0].setAttribute("class", define.class_name.branch_text_option_active)

						node.parentElement.children[1].style.display = "block"
						option_state.chosen.node                     = node
						option_state.value.text                      = node.getAttribute("data-option-value")

					} else { 

						node.setAttribute("class", define.class_name.branch_text_option_wrap )
						node.children[0].setAttribute("class", define.class_name.branch_text_option )

						option_state.chosen.node.parentElement.children[1].style.display = "none"
						option_state.chosen.node                                         = false
						option_state.value.text                                          = ""
					}

					return heard
				}
			},
			{
				for       : "tree option button click",
				that_does : function ( heard ) {

					var node, option_path, option_state, name, result_body
					node         = ( heard.event.target.getAttribute("data-tree-option") ? 
						heard.event.target : 
						heard.event.target.parentElement
					)
					name         = node.getAttribute("data-name")
					option_state = heard.state
					option_path  = ( 
						option_state.chosen.node ?
							option_state.chosen.node.getAttribute("data-option-path") :
							""
					)
					option_state.body.result.get("result name").body.textContent = option_state.value.text || "Nothing"
					option_state.body.result.get("result path").body.textContent = option_path
					option_state.value.path                                      = option_path.split(" -> ").concat(option_state.chosen.value).join(":")

					return heard
				}
			},
			{
				for       : "tree option branch click",
				that_does : function ( heard ) {

					var branch_node, branch_wrap_node
					branch_wrap_node = ( 
						heard.event.target.getAttribute("data-branch") ? 
							heard.event.target : 
							heard.event.target.parentElement
					)
					branch_node = branch_wrap_node.nextSibling

					if ( branch_node.getAttribute("data-state") === "closed" ) {
						branch_node.style.display                = "block"
						branch_wrap_node.children[0].textContent = "+";
						branch_wrap_node.setAttribute("class", define.class_name.branch_text_wrap_active)
						branch_node.setAttribute("data-state", "open" )
					} else { 
						branch_node.style.display                = "none"
						branch_wrap_node.children[0].textContent = "-";
						branch_wrap_node.setAttribute("class", define.class_name.branch_text_wrap)
						branch_node.setAttribute("data-state", "closed" )
					}
					return heard
				}
			}
		]
	},

	get_node_of_every_open_branch : function ( get ) {
		var self = this
		return this.library.morph.index_loop({ 
			subject : get.tree,
			into    : get.into || [],
			else_do : function ( loop ) {
				if ( loop.indexed.firstChild.hasAttribute("data-branch") ) {

					var branch_wrap_node
					branch_wrap_node = loop.indexed.lastChild

					if ( branch_wrap_node.getAttribute("data-state") === "open" ) {
						loop.into        = loop.into.concat( branch_wrap_node )
					}

					return loop.into.concat(self.get_node_of_every_open_branch({
						tree : branch_wrap_node.children
					}))

				} else { 
					return loop.into
				}
			}
		})
	},

	define_body : function ( define ) {
		return {
			"class"   : define.class_name.wrap,
			"child"   : [
				{
					"mark_as" : "tree",
					"class"   : define.class_name.tree_wrap,
					"child"   : this.define_call_option_tree_body({
						name       : define.name,
						tree       : define.with.tree,
						parent     : [],
						class_name : define.class_name,
						button     : define.with.button	
					})
				}
			].concat(
				this.define_call_option_tree_result( define )
			)
		}
	},

	define_call_option_tree_body : function ( define ) {

		var self = this

		return this.library.morph.object_loop({
			subject : define.tree.child,
			"into?" : [],
			else_do : function ( loop ) {
				if ( loop.value.child ) { 
					return {
						into : loop.into.concat({ 
							"class" : define.class_name.branch,
							"child" : self.define_tree_branch_text({
								define     : loop.value,
								parent     : define.parent,
								class_name : define.class_name,
								button     : define.button
							}) 
						})
					}
				} else {
					return {
						into : loop.into.concat({ 
							"class" : define.class_name.branch,
							"child" : self.define_tree_branch_option_text({
								define     : loop.value,
								parent     : define.parent,
								class_name : define.class_name,
								button     : define.button
							})
						})
					}
				}
			}
		})

		return this.library.morph.object_loop({
			subject : define.tree,
			"into?" : [],
			else_do : function ( loop ) {
				return {
					into : loop.into.concat(
						self.define_tree_branch_option_text({
							define     : loop,
							name       : define.name,
							parent     : define.parent,
							class_name : define.class_name,
							button     : define.button
						})
					)
				}
			}
		})
	},

	define_tree_branch_option_text : function ( branch ) {
		return [
			{
				"class"             : branch.class_name.branch_text_option_wrap,
				"data-tree-option"  : "true",
				"data-option-value" : branch.define.text,
				"data-option-path"  : branch.parent.join(" -> "),
				"data-name"         : branch.name,
				"child"             : [
					{
						"class" : branch.class_name.branch_text_option
					},
					{
						"class" : branch.class_name.branch_text,
						"text"  : branch.define.text
					},
				]
			},
			{
				"class"   : branch.class_name.branch_text_option_button_wrap,
				"display" : "none",
				"child"   : this.define_button({
					button     : branch.button,
					class_name : branch.class_name,
					name       : branch.name
				})
			}
		]
	},

	define_tree_branch_text : function ( branch ) {
		return [
			{
				"class"       : branch.class_name.branch_text_wrap,
				"data-branch" : "true",
				child         : [
					{
						"class" : branch.class_name.branch_text_badge,
						"text"  : "-"
					},
					{
						"class" : branch.class_name.branch_text,
						"text"  : branch.define.text
					},
				]
			},
			{
				"display"    : "none",
				"class"      : branch.class_name.branch_children,
				"data-state" : "closed",
				"child"      : this.define_call_option_tree_body({
					name       : branch.name,
					tree       : branch.define,
					parent     : branch.parent.concat( branch.define.text ),
					class_name : branch.class_name,
					button     : branch.button
				})
			}
		]
	},

	define_call_option_tree_result : function ( define ) {
		return { 
			"class"   : define.class_name.result_wrap,
			"mark_as" : "result",
			child   : [
				{
					"class" : define.class_name.result_path_wrap,
					child   : [
						{
							"class" : define.class_name.result_text,
							"text"  : "Chose :"
						},
						{
							"class"   : define.class_name.result_choice,
							"title"   : "Click to unselect",
							"mark_as" : "result name",
							"text"    : "Nothing"
						},
						{
							"class" : define.class_name.result_text,
							"text"  : "in"
						},
						{
							"class"   : define.class_name.result_path,
							"mark_as" : "result path",
							"text"    : ""
						},
					]	
				},
				{
					"class" : define.class_name.result_button_wrap,
					"child" : this.define_button({
						button     : define.with.button,
						class_name : define.class_name,
						name       : define.name
					})
				}
			]
		}
	},

	define_button : function ( define ) { 
		return this.library.morph.index_loop({
			subject : define.button,
			else_do : function ( loop ) {
				return loop.into.concat({
					"class"            : define.class_name.result_button,
					"data-tree-submit" : loop.indexed,
					"data-name"        : define.name,
					"text"             : loop.indexed
				})
			}
		})
	}
})