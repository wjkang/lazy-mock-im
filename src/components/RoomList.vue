<template>
  <aside class="menu">
    <p class="menu-label">
      Chat Rooms
      <a class="button is-small is-info" @click="addRoom">add</a>
    </p>
    <ul class="menu-list">
      <b-collapse :open="item.id==chatRoom.id" v-for="(item,index) in roomList" :key="index">
        <li slot="trigger" class="menu-list-item">
          <a :class="{'is-active':item.id==chatRoom.id}">{{item.name}}</a>
          <a v-show="item.id!=chatRoom.id&&!chatRoom.id" class="button is-light enter-btn" @click="changeChatRoom(item)">enter</a>
        </li>
        <li v-show="item.userList&&item.userList.length>0">
          <ul>
            <li v-for="(user,index) in item.userList" :key="index">
              <a>{{user.name}}</a>
            </li>
          </ul>
        </li>
      </b-collapse>
    </ul>
    <b-modal :active.sync="isCreateModalActive" has-modal-card>
      <div class="modal-card" style="width: auto;text-align:left">
        <header class="modal-card-head">
          <p class="modal-card-title">create room</p>
        </header>
        <section class="modal-card-body">
          <b-field label="Name">
            <b-input type="text" v-model="newRoomName" placeholder="room name" required>
            </b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button class="button" type="button" @click="isCreateModalActive=false">Close</button>
          <button class="button is-primary" @click="saveRoom">Save</button>
        </footer>
      </div>
    </b-modal>
  </aside>
</template>
<script>
export default {
  data() {
    return {
      isCreateModalActive: false,
      newRoomName: ""
    };
  },
  props: {
    chatRoom: Object
  },
  computed: {
    roomList() {
      return this.$store.state.roomList;
    }
  },
  methods: {
    changeChatRoom(room) {
      if (this.chatRoom.id == room.id) {
        return;
      }
      let client = this.$wsClients.get("im");
      client.emit("enterRoom", {
        user: { ...this.$store.state.user },
        room: { id: room.id, name: room.name }
      });
      this.$emit("changeChatRoom", { id: room.id, name: room.name });
    },
    addRoom() {
      this.isCreateModalActive = true;
    },
    saveRoom() {
      if (this.newRoomName == "") {
        return;
      }
      let client = this.$wsClients.get("im");
      client.emit("addRoom", {
        name: this.newRoomName
      });
      this.isCreateModalActive = false;
      this.newRoomName = "";
    }
  },
  mounted() {
    let client = this.$wsClients.get("im");
    if (!client) {
      return;
    }
    client.on("addRoom", data => {
      this.$store.commit("addRoom", { ...data, userList: [] });
    });
    client.on("enterRoom", data => {
      this.$store.commit("addRoomUser", data);
    });
    client.on("leaveRoom", data => {
      this.$store.commit("delRoomUser", data);
    });
    client.on("removeRoom", function(data) {});
  },
  destroyed() {
    let client = this.$wsClients.get("im");
    client.removeAllListeners();
  }
};
</script>
<style lang="less" scoped>
.menu-list li {
  width: 80%;
}
.is-inactive {
  cursor: not-allowed;
}
.is-small {
  font-size: 0.25em;
  height: 1.5em;
}
.menu-list-item {
  position: relative;
  .enter-btn {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>


