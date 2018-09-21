<template>
    <aside class="menu">
        <p class="menu-label">
            Chat Square
        </p>
        <ul class="menu-list">
            <li v-for="(item,index) in userList" :key="index" :class="{'badge is-badge-success':item.msgCount>0}" :data-badge="item.msgCount">
                <a v-if="currentUser.id==item.id" class="is-inactive">{{item.name}}</a>
                <a v-else :class="{'is-active':item.id==chatUser.id}" @click="changeChatUser(item)">{{item.name}}</a>
            </li>
        </ul>
        <!-- <p class="menu-label">
            Administration
        </p>
        <ul class="menu-list">
            <li>
                <a>Team Settings</a>
            </li>
            <li>
                <a class="is-active">Manage Your Team</a>
                <ul>
                    <li>
                        <a>Members</a>
                    </li>
                    <li>
                        <a>Plugins</a>
                    </li>
                    <li>
                        <a>Add a member</a>
                    </li>
                </ul>
            </li>
            <li>
                <a>Invitations</a>
            </li>
            <li>
                <a>Cloud Storage Environment Settings</a>
            </li>
            <li>
                <a>Authentication</a>
            </li>
        </ul> -->
    </aside>
</template>
<script>
import "../style/bulma.badge.css";
export default {
  data() {
    return {
      chatUser: {
        id: "",
        name: ""
      }
    };
  },
  props: {
    userList: Array,
    currentUser: Object
  },
  methods: {
    changeChatUser(user) {
      if (this.chatUser.id == user.id) {
        return;
      }
      this.chatUser = {
        ...user
      };
      this.$emit("changeChatUser", { ...user });
    }
  }
};
</script>
<style lang="less" scoped>
.menu-list li{
    width: 80%;
}
.is-inactive {
  cursor: not-allowed;
}
</style>


