var FXManager = require('FXManager');
var UIMng = Fire.Class({
    extends: Fire.Behavior,
    onLoad: function() {
        //fx manager
        // this.fxManager = FXManager.instance;
        // fighters
        this.icons = this.getChildren();
        this.playerIcons = [];
        this.enemyIcons = [];
        this.origScale = 0.25;
        for (var i = 0; i < this.icons.length; ++i) {
            var icon = this.icons[i];
            icon.setScale(this.origScale);
        }
        // scale
        this.actionPop = cc.sequence(cc.scaleTo(0.2, this.origScale * 1.4).easing(cc.easeBackOut()), cc.scaleTo(0.2, this.origScale).easing(cc.easeBackOut()));
    },
    playPop: function(index) {
        var icon = this.icons[index];
        if (icon) {
            icon.runAction(this.actionPop);
            var fx = FXManager.instance.playFX(cc.p(icon.x, icon.y), FXManager.FXType.Flash, 1);
        }
    }
});
