import Player from '../sprites/player'
import Enemy from '../sprites/enemy'

export default class Level extends Phaser.Scene {
  constructor() 
  {
    super({
      key: 'Level'
    });
  }

  create() 
  {
    //point the variable at the registry which is assigned either at the Preload scene or just prior to level restart
    let load = this.registry.get('load');

    //load music based on registry value, loop, and play
    this.music = this.sound.add(`${load}Music`);
    this.music.setLoop(true);
    this.music.play();

    //load map based on registry value, set physics bounds, and create layer
    this.map = this.make.tilemap({ key: `${load}Map` });
    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;
    let tileset = this.map.addTilesetImage('tiles');
    this.layer = this.map.createStaticLayer('tileLayer', tileset, 0, 0);
    this.layer.setCollisionByProperty({ collide: true }); //make the layer collidable by the property set on the tileset in Tiled

    //set up groups, tell group to run updates on its children, then call the object conversion method
    this.enemies = this.add.group(null);
    this.enemies.runChildUpdate = true;
    this.convertObjects();

    //tell the physics system to collide player, appropriate tiles, and other objects based on group
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.player, this.enemies);
    this.physics.add.collider(this.enemies, this.layer);
  }

  update (time, delta) 
  {
    this.player.update(time, delta);
  }

  convertObjects() 
  {
    //objects in map are checked by type(assigned in object layer in Tiled) and the appopriate extended sprite is created
    let objects = this.map.getObjectLayer("objects");
    objects.objects.forEach(
      (object) => {
        if (object.type === "player") {
          this.player = new Player({
          scene: this,
          x: object.x + 8, 
          y: object.y - 8,
          });
        }
        if (object.type === "enemy") {
          let enemy = new Enemy({
          scene: this,
          x: object.x + 8, 
          y: object.y - 8,
          });
          this.enemies.add(enemy);
        }
      });
  }

  end()
  {
    //restart the scene. You can place additional cleanup functions in here
    this.music.stop();
    this.scene.restart();
  }

}