/**
 * @此专题出自澎湃新闻网，http://thepaper.cn,
 * @date    2015-12-10 12:00:00
 *By jigl@thepaper.cn

文字记者：   陈荣辉    吴艳洁    郑怡雯 
摄影记者：   陈荣辉 
视频剪辑：   顾一帆    张    登    王    辰 
数据图表：   张泽红    吕    妍 
项目统筹：   杨深来    郑    洁 
页面设计：   张金伟    王国庆 
页面制作：   季国亮
 */
var $window = $(window);

var winW = $window.width(),
    winH = $window.height();

var longPull = {
    startY : 0,
    endY : 0,
    scrollBorder : '',
    minDistance : 20,
    topbar : $('#topbar').on('click', '#menu', function(event) {
            event.preventDefault();
            var $this = $(this);
            $this.toggleClass('menu-active');
            longPull.nav.stop().slideToggle();
        }),
    menu : $('#menu'),
    nav : $('.nav'),
    ft_page : $('.ft-page'),
    chapter_box : $('.chapter-box').on('touchstart',function(event){
            //event.preventDefault();
            longPull.menu.removeClass('menu-active');
            longPull.nav.stop().slideUp('slow');
    }),
    cur_chapter:'',
    slides : $('.ft-page-slider').width(winW).height(winH),
    ajax_loading : $('.ajax-loading'),
    //init ft-page slide;
    ft_page_swiper : new Swiper('.ft-page',{
            slideClass:'ft-page-slider',
            wrapperClass:'ft-page-wrapper',
            direction:'vertical'
        }),
    chapter_li : $('.chapter-li').on('click',function(){
            var $this = $(this);
            $this.siblings().removeClass('active');
            $this.addClass('active');
            setTimeout(function() {
                longPull.loadChapter($this.data('chapter'));
                !longPull.topbar.hasClass('show')?longPull.topbar.addClass('show'):'';
            }, 500);
        }),
    nav_li:$('.nav-li').on('touchend',function(){
                    $(this).removeClass('show');
                    longPull.loadChapter(this.dataset.chapter);
                    !longPull.topbar.hasClass('show')?longPull.topbar.addClass('show'):'';
                    longPull.menu.toggleClass('menu-active');
                    longPull.nav.stop().slideToggle();
                    setTimeout(function() {
                        longPull.loadChapter($(this).data('chapter'));
                        !longPull.topbar.hasClass('show')?longPull.topbar.addClass('show'):'';
                    }, 1000);
                })
                .on('touchstart',function(){
                    $(this).addClass('show');
                }),
    chapterTouchStarted:function(event){
            longPull.scrollBorder = longPull.scrollEnd(this);

            if(event.originalEvent.targetTouches){
                longPull.startY = event.originalEvent.targetTouches[0].clientY;
            }else{
                longPull.startY = event.clientY;
            }
            if((longPull.scrollBorder=='scrollTopEnd')||(longPull.scrollBorder=='scrollBottomEnd')){
                    longPull.ajax_loading.addClass('show');
                }
        },
    chapterTouchMoved:function(event){
            if(longPull.startY>0){
                if(event.originalEvent.targetTouches){
                    longPull.endY = event.originalEvent.changedTouches[0].clientY;
                }else{
                    longPull.endY = event.clientY;
                }
            }
    },
    chapterTouchEnded:function(event){
        if(longPull.startY>0){
                if(event.originalEvent.targetTouches){
                    longPull.endY = event.originalEvent.changedTouches[0].clientY;
                }else{
                    longPull.endY = event.clientY;
                }
            }
            longPull.ajax_loading.removeClass('show');
            var  yDis = longPull.endY - longPull.startY;
            if(Math.abs(yDis)>longPull.minDistance&&longPull.endY>0){
                if(yDis<0&&longPull.scrollBorder=='scrollBottomEnd'){
                    //swipe up and load next chapter;
                    var nextChapter = this.dataset.next;
                    longPull.loadChapter(nextChapter);
                }
                else if(yDis>0&&longPull.scrollBorder=='scrollTopEnd'){
                    //swipe down and load prev chapter;
                    var prevChapter = this.dataset.prev;
                    if(longPull.cur_chapter=='boarding'){
                        longPull.backToMenu();
                    }
                    else{
                        longPull.loadChapter(prevChapter);
                    }
                }
            }
            longPull.startY = longPull.endY=0;
        },
    scrollEnd:function(chapter){
            if(scrollY==0){
                return 'scrollTopEnd';
            }
            if((scrollY+winH)==chapter.scrollHeight){
                return 'scrollBottomEnd';
            }
            return false;
        },
    backToMenu:function(){
            longPull.ft_page_swiper.slideTo(0);
            longPull.ft_page.removeClass('hide');
            longPull.chapter_box.addClass('hide');
            longPull.topbar.removeClass('show');
            longPull.cur_chapter='';
            longPull.chapter_li.removeClass('active');
    },
    loadChapter:function(chapter){
            if(!chapter||(longPull.cur_chapter == chapter)) return;
            longPull.cur_chapter = chapter;

            longPull.nav_li.removeClass('active')
                    .filter(function(){
                        return this.dataset.chapter==chapter;
                    })
                    .addClass('active');
            $.ajax({
                type:'GET',
                url:chapter+'.html',
                dataType:'html',
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    xhr.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            longPull.ajax_loading.addClass('show');
                        }
                    });
                    return xhr;
                    },
                success:function(data,textStatus){
                    longPull.ft_page.addClass('hide');
                    //longPull.ajax_loading.removeClass('show');
                    longPull.chapter_box.html(data)
                            .removeClass('hide');

                    $('.chapter').on('touchstart',longPull.chapterTouchStarted)
                                .on('touchend',longPull.chapterTouchEnded);
                    window.scrollTo(0,0);
                    longPull.loadingEnd();
                    },
                beforeSend:function(){
                    longPull.ajax_loading.addClass('show');
                }
            });
        },
    loadingEnd:function(){
        var cover = document.getElementById("cover");
        cover.addEventListener('touchstart',function(ev){
            oldPos = ev.changedTouches[0]['clientY'];
        });
        $('.full-height').css({'width':winW,'height':winH});
        $('.footer-nav-li').on('click',function(){
                longPull.loadChapter(this.dataset.chapter);
            });
        cover_bg_loaded();       
    }
};
//create paper-slide
function Paper_Slide(options){
    var _this = this;

    var setting = {
        albumsPath : "../albums/",
        dataPath:'assets/',
        albumsContainersClass : ".paper-slides-box",
        containerWidth :'900'
    };

    $.extend(setting,options);

    this.albumsContainer = d3.selectAll(setting.albumsContainersClass);

    this.getAlbumsData = function(){
        d3.json(setting.dataPath+setting.albumsDataFile+'.json',function(error,json){
            if(error) { 
                console.log(error);
                return false;
            }
            json.forEach(function(ele){
                var range = d3.range(ele.captions.length);
                ele.pics = range.map(function(num){
                    return ele.name+'-'+(num+1)+'.jpg';
                })

                ele.slides =d3.zip(ele.pics,ele.captions);
            })
            _this.albumsData = json;
            _this.albumsContainer.datum(function(){
                                    var name = this.dataset.album;
                                    return json.filter(function(ele){
                                                        return ele.name == name;
                                                    })[0]
                                })
                                .each(function(d){
                                    $(this).addClass(d.name);
                                });

            _this.createSwiper();
        });
    };
    this.showSlideArrow = function(){
        var mouseX= d3.mouse(this)[0];

        var curPrevButton = d3.select(this).select('.swiper-button-prev');
        var curNextButton = d3.select(this).select('.swiper-button-next');

        if(mouseX<setting.containerWidth/2){
            curPrevButton.classed('show',true);
            curNextButton.classed('show',false);
        }
        else{
            curPrevButton.classed('show',false);
            curNextButton.classed('show',true);
        }
    };
    this.createSwiper = function(){
        var swiperContainer = _this.albumsContainer.append('div')
                                    .attr('class',function(d,i){
                                        return 'swiper-container swiper-container-'+i;
                                    })
                                    .on('mousemove',_this.showSlideArrow)
                                    .on('mouseout',function(){
                                        d3.selectAll('.swiper-button-prev,.swiper-button-next').classed('show',false);
                                    });
        var swiperWrapper = swiperContainer.append('div').classed('swiper-wrapper',true);

        //append swiper button
        var swiperPrev = swiperContainer.append('div')
                        .attr('class',function(d,i){
                            return 'swiper-button-prev swiper-button-prev-'+i;
                        });
        var swiperPrev = swiperContainer.append('div')
                        .attr('class',function(d,i){
                            return 'swiper-button-next swiper-button-next-'+i;
                        });

        var swiperPagintion = swiperContainer.append('div')
                        .attr('class',function(d,i){
                            return 'swiper-pagination pagination-'+i;
                        });

        var swiperSlides = swiperWrapper.selectAll('div')
                                    .data(function(d){return d.slides})
                                    .enter()
                                    .append('div')
                                    .classed('swiper-slide',true);
        var slidePic = swiperSlides.append('div')
                                   .classed('slide-pic',true)
                                   .append('img')
                                   .attr('src',function(d){return setting.albumsPath+d[0]}) 
                                   .attr('width','100%');
        var slideCaption = swiperSlides.append('div')
                                    .classed('slide-caption media-caption',true)
                                    .html(function(d){return d[1];});

        swiperContainer.each(function(d, i) {
            var thisContainer = this;
            var container = '.swiper-container-'+i;
            var swiper = new Swiper(container, {
                    pagination: '.pagination-'+i,
                    paginationClickable: '.pagination-'+i,
                    prevButton:'.swiper-button-prev-'+i,
                    nextButton:'.swiper-button-next-'+i
                });

            d3.select(thisContainer).select('.swiper-pagination')
                    .style('top',function(){
                        var height;
                        height = d.ratio?swiper.width*d.ratio:swiper.width*0.66665;
                       return height-25+'px';
                    })
        });                                             
    };

    this.init = function(){
        _this.getAlbumsData()
    };
    this.init();
}
//create paper-video
function Paper_Video(){
    var _this = this;
    this.init = function(){       
        this.paper_video_container = d3.select('.paper-video');
        this.video_name = this.paper_video_container.node().dataset.name;
        $('.paper-video').parent().addClass(_this.video_name);
        this.apppend_ui();
    };
    this.apppend_ui = function(){
        _this.video = this.paper_video_container.append('video')
                        .attr('src','../images/'+this.video_name+'.mp4')
                        .attr('preload','auto')
                        .attr('controls',true);

        _this.video_ele = _this.video.node();
        _this.video_ele.addEventListener('pause',_this.pause_video,false);
        _this.video_ele.addEventListener('play',_this.pplay_video,false);

        _this.video_cover = this.paper_video_container.append('div')
                        .classed('video-cover',true);

        _this.video_cover.append('div')
                        .append('img')
                        .attr('src','../images/'+this.video_name+'.jpg');

        _this.play_button = _this.video_cover.append('div')
                        .classed('play-icon',true)
                        .on('touchstart',_this.play_video);
    };
    this.play_video = function(){
        $(this).parent().hide();
        _this.video_ele.play();
    };
    this.pause_video = function(){
        _this.video_cover.style('display','block');
    }
    this.init();
}
//create compare-slide
function Compare_Slide(options){
    var _this = this;

    var setting = {
        albumsPath : "../albums/",
        albumsContainersClass : ".compare-slide-box",
        containerWidth :'900',
        height:'655'
    };
    var albumData = [['album7-1.jpg','album7-2.jpg'],
                        ['album7-3.jpg','album7-4.jpg'],
                        ['album7-5.jpg','album7-6.jpg']];
    $.extend(setting,options);

    this.albumsContainer = d3.select(setting.albumsContainersClass);
    this.cur_index = 0;
    this.loadedNum = 0;

    this.createCompare = function(){
        var compareContainer = _this.albumsContainer.append('div')
                                    .classed('compare-container',true)
                                    .datum(albumData);
        
        _this.compareWrapper = compareContainer.append('div').classed('compare-wrapper cl',true);
        //append compare button
        var compare_btns = compareContainer.append('div').classed('compare-btns',true);
        _this.comparePrev = compare_btns.append('div')
                        .attr('class','compare-btn compare-prev')
                        .on('touchend',_this.showPrev);

        _this.comparePagintionsBullet = compare_btns.append('div')
                        .attr('class','compare-pagination')
                        .selectAll('span')
                        .data(d3.range(3))
                        .enter()
                        .append('span')
                        .classed('compare-pagination-bullet',true);

        _this.compareNext = compare_btns.append('div')
                        .attr('class','compare-btn compare-next')
                        .on('touchend',_this.showNext);

        _this.compareSlides = _this.compareWrapper.selectAll('div')
                                    .data(function(d){return d})
                                    .enter()
                                    .append('div')
                                    .classed('compare-slide',true)
                                    .style('height',function(){
                                        return winW*600/900+'px';
                                    });
        var comparePicsBox = _this.compareSlides.append('div')
                                   .classed('compare-pics twentytwenty',true);
        var comparePicLeft = comparePicsBox
                                   .append('img')
                                   .attr('src',function(d){return setting.albumsPath+d[0]}) 
                                   .attr('width','100%');
        var comparePicRight = comparePicsBox
                                   .append('img')
                                   .attr('src',function(d){return setting.albumsPath+d[1]}) 
                                   .attr('width','100%');
        compareContainer.append('p')
                                .classed('media-caption',true)
                                .html('\u5308\u7259\u5229\u5173\u95ed\u8fb9\u5883\u524d\uff0c\u6bcf\u5929\u6709\u4e0a\u5343\u540d\u96be\u6c11\u4ece\u514b\u7f57\u5730\u4e9a\u8fdb\u5165\u8be5\u56fd\u3002\u5173\u95ed\u8fb9\u5883\u540e\uff0c\u5df2\u65e0\u4eba\u53ef\u4ee5\u901a\u8fc7\u8fd9\u6761\u8def\u7ebf\u8fdb\u5165\u5308\u7259\u5229\u5883\u5185\u3002\u002f\u0020\u89c6\u89c9\u4e2d\u56fd\u0026\u006e\u0062\u0073\u0070\u0026\u006e\u0062\u0073\u0070\u56fe\u003c\u0062\u0072\u002f\u003e\uff08\u5de6\u53f3\u62d6\u52a8\u770b\u8fb9\u5883\u524d\u540e\u5bf9\u6bd4\u56fe\uff09');

        d3.selectAll('.compare-slide img').each(function(){
            this.onload = function(){
                _this.loadedNum++;
                if(_this.loadedNum==6){
                    _this.initTwentytwenty();
                }
            }
        })
    };
    this.showPrev = function(){
        if(_this.cur_index==0) return;
        if(--_this.cur_index==0){
            _this.comparePrev.classed('hide',true);
        }
        _this.compareNext.classed('hide',false);
        _this.switchBullet();
    };
    this.showNext = function(){
        if(_this.cur_index==2) return;
        if(++_this.cur_index==2){
            _this.compareNext.classed('hide',true);
        }
        _this.comparePrev.classed('hide',false);
        _this.switchBullet();
    };
    this.switchBullet = function(){
        _this.compareWrapper.style('-webkit-transform','translateX(-'+33.33*_this.cur_index+'%)')
                            .style('transform','translateX(-'+33.33*_this.cur_index+'%)');
        _this.comparePagintionsBullet
                    .classed('active',function(d){
                        return _this.cur_index==d? true:false;
                    })
    }
    this.initTwentytwenty = function(){
        $('.twentytwenty').twentytwenty();
        _this.comparePrev.classed('hide',true);
        _this.comparePagintionsBullet.filter(function(d,i){
            return i==0;
        })
        .classed('active',true);
    }
    this.init = function(){
        _this.createCompare();
    };
    this.init();
}

function cover_bg_loaded(){
    var cover = $('#cover');
    var image = new Image();

    image.onload = function(){
        cover.addClass('show');
        longPull.ajax_loading.removeClass('show');
    }
    image.src = cover.css('background-image').replace("url(","").replace(")","");
}
$(function(){
    var mbg = $('.ft-page-movie').css('background-image');
    var image = new Image();
    image.onload = function(){
        $('.ft-page-title').addClass('show');
    }
    image.src = './images/ft-page-cover.jpg';
})
//wxshare config
var directory = location.origin+location.pathname.substring(0, location.pathname.lastIndexOf('/'));//  文档目录
var shareInfo = {
    shareTitle:$('title').text(),    //填写社交分享的标题；
    shareDesc:"澎湃新闻记者历时15天，跨越近4000公里，全程跟踪难民逃亡欧洲路线，近距离了解欧洲造成最深远冲击的这一事件。", 
    shareLink:location.href,    //填写社交分享的链接；
    sharePic:directory+"/wxshare.jpg",//分享的图片地址
};

//get weixin share config;
var wxConfigParams={};
$.post("http://projects.thepaper.cn/wxShare/jssdk.php", {url: location.href}, function(data, textStatus, xhr) {
    if(data){
            data =JSON.parse(data.trim());
            wxConfigParams.debug = false;
            wxConfigParams.appId = data.appId;
            wxConfigParams.timestamp = data.timestamp;
            wxConfigParams.nonceStr = data.nonceStr;
            wxConfigParams.signature = data.signature;
            wxConfigParams.jsApiList = ['onMenuShareTimeline','onMenuShareAppMessage'];
            wx.config(wxConfigParams);
            wx.ready(function(){
                wx.onMenuShareTimeline({
                    title:shareInfo.shareTitle,
                    imgUrl:shareInfo.sharePic,
                    link:shareInfo.shareLink,
                    desc:shareInfo.shareDesc
                });
                wx.onMenuShareAppMessage({
                    title:shareInfo.shareTitle,
                    imgUrl:shareInfo.sharePic,
                    link:shareInfo.shareLink,
                    desc:shareInfo.shareDesc
                });
            })
        }
});