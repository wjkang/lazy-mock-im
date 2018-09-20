<template>
    <aside class="menu">
        <p class="menu-label">
            Chat Square
        </p>
        <ul class="menu-list">
            <li v-for="(item,index) in userList" :key="index">
                <a>{{item.name}}</a>
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
export default {
  computed: {
    userList() {
      return this.$store.state.userList;
    }
  }

};
</script>

