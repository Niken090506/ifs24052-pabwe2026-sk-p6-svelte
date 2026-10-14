<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import AddModal from "../modals/AddModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    Plus,
    Link,
    Globe,
    Lock,
    EyeOff,
    User,
    Eye,
    Pencil,
    Trash2,
    Funnel,
    Search,
    LoaderCircle,
  } from "lucide-svelte";

  let loadingTrees = false;
  let filter = "";
  let searchQuery = "";
  let showAddModal = false;
  let showChangeModal = false;
  let selectedTreeId = null;

  $: profile = $usersStore.profile;
  $: linkTrees = $linkTreesStore.linkTrees || [];

  onMount(() => {
    loadLinkTrees();
  });

  function loadLinkTrees() {
    loadingTrees = true;
    Promise.resolve(linkTreesStore.asyncSetLinkTrees(filter)).finally(() => {
      loadingTrees = false;
    });
  }

  let prevFilter = filter;
  $: if (filter !== prevFilter) {
    prevFilter = filter;
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreesDeleted) {
    linkTreesStore.setIsLinkTreesDeleted(false);
    loadLinkTrees();
  }

  function handleEditLinkTree(id) {
    selectedTreeId = id;
    showChangeModal = true;
  }

  async function handleDeleteLinkTree(id) {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus link tree ini?"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDelete(id);
    }
  }

  async function handleDeleteAllLinkTrees() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus SEMUA data link tree Anda secara permanen?"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreesDelete();
    }
  }

  $: filteredLinkTrees = linkTrees.filter((tree) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = tree.title ? tree.title.toLowerCase() : "";
    const description = tree.description ? tree.description.toLowerCase() : "";
    return title.includes(q) || description.includes(q);
  });

  $: totalCount = linkTrees.length;
  $: publicCount = linkTrees.filter((t) => t.type === "public").length;
  $: myCount = linkTrees.filter(
    (t) => profile && t.user_id === profile.id
  ).length;
</script>

{#if profile}
  <div class="space-y-8 animate-in fade-in duration-300">
    <!-- Header Banner -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1
          class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          Daftar Link Tree
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Kelola dan pantau semua halaman kumpulan tautan Anda secara
          terorganisir.
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        {#if linkTrees.length > 0}
          <button
            type="button"
            data-testid="delete-all-linktrees-btn"
            on:click={handleDeleteAllLinkTrees}
            class="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all"
            title="Hapus Semua Link Tree"
          >
            <Trash2 size={16} />
            <span>Hapus Semua</span>
          </button>
        {/if}

        <button
          type="button"
          data-testid="add-linktree-btn"
          on:click={() => (showAddModal = true)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Link Tree</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Total Link Tree
          </p>
          <h3 class="text-3xl font-black text-slate-800 mt-1">{totalCount}</h3>
        </div>
        <div
          class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"
        >
          <Link size={26} strokeWidth={2} />
        </div>
      </div>

      <div
        class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Visibilitas Publik
          </p>
          <h3 class="text-3xl font-black text-emerald-600 mt-1">
            {publicCount}
          </h3>
        </div>
        <div
          class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"
        >
          <Globe size={26} strokeWidth={2} />
        </div>
      </div>

      <div
        class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Milik Saya
          </p>
          <h3 class="text-3xl font-black text-amber-600 mt-1">{myCount}</h3>
        </div>
        <div
          class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"
        >
          <User size={26} strokeWidth={2} />
        </div>
      </div>
    </div>

    <!-- Table & Controls Section -->
    <div
      class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      <!-- Filter bar -->
      <div
        class="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="relative flex-1 max-w-md">
          <label for="search-linktree-input" class="sr-only"
            >Cari judul atau rincian link tree</label
          >
          <Search
            size={18}
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="search-linktree-input"
            type="text"
            data-testid="search-linktree-input"
            bind:value={searchQuery}
            placeholder="Cari judul atau rincian link tree..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <span
            class="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5"
          >
            <Funnel size={16} /> Filter:
          </span>
          <div
            class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600"
          >
            <button
              type="button"
              data-testid="filter-all-btn"
              on:click={() => (filter = "")}
              class="px-3 py-1.5 rounded-lg transition-all {filter === ''
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'}"
            >
              Semua
            </button>
            <button
              type="button"
              data-testid="filter-mine-btn"
              on:click={() => (filter = "1")}
              class="px-3 py-1.5 rounded-lg transition-all {filter === '1'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'hover:text-slate-900'}"
            >
              Milik Saya
            </button>
          </div>
        </div>
      </div>

      <!-- Responsive Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead
            class="bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-100"
          >
            <tr>
              <th scope="col" class="px-5 py-3.5 text-center w-16">ID</th>
              <th scope="col" class="px-5 py-3.5">Judul Link Tree</th>
              <th scope="col" class="px-5 py-3.5">Tipe</th>
              <th scope="col" class="px-5 py-3.5 hidden md:table-cell"
                >Pembuat</th
              >
              <th scope="col" class="px-5 py-3.5 hidden lg:table-cell"
                >Dibuat</th
              >
              <th scope="col" class="px-5 py-3.5 text-center">Tautan</th>
              <th scope="col" class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#if loadingTrees && filteredLinkTrees.length === 0}
              <tr>
                <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                  <LoaderCircle
                    size={36}
                    class="mx-auto text-indigo-600 animate-spin mb-2"
                  />
                  <p class="font-medium text-slate-600">
                    Memuat daftar link tree...
                  </p>
                </td>
              </tr>
            {:else if filteredLinkTrees.length === 0}
              <tr>
                <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                  <Link size={40} class="mx-auto text-slate-300 mb-2" />
                  <p class="font-medium">
                    Belum ada data link tree yang cocok.
                  </p>
                </td>
              </tr>
            {:else}
              {#each filteredLinkTrees as tree (tree.id)}
                <tr
                  data-testid={`linktree-row-${tree.id}`}
                  class="hover:bg-slate-50/70 transition-colors group"
                >
                  <td
                    class="px-5 py-4 text-center font-mono text-xs font-bold text-slate-400"
                  >
                    {"#" + tree.id}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      {#if tree.cover}
                        <img
                          src={tree.cover}
                          alt={tree.title}
                          class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      {/if}
                      <div>
                        <p class="font-semibold text-slate-800 leading-snug">
                          {tree.title}
                        </p>
                        {#if tree.description}
                          <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {tree.description}
                          </p>
                        {/if}
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    {#if tree.type === "public"}
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      >
                        <Globe size={12} />
                        Publik
                      </span>
                    {:else if tree.type === "unlisted"}
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60"
                      >
                        <EyeOff size={12} />
                        Unlisted
                      </span>
                    {:else}
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
                      >
                        <Lock size={12} />
                        Privat
                      </span>
                    {/if}
                  </td>
                  <td class="px-5 py-4 hidden md:table-cell text-xs text-slate-600">
                    <div class="flex items-center gap-2">
                      {#if tree.author?.photo}
                        <img
                          src={tree.author.photo}
                          alt={tree.author.name}
                          class="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      {/if}
                      <span class="truncate">{tree.author?.name || "-"}</span>
                    </div>
                  </td>
                  <td
                    class="px-5 py-4 hidden lg:table-cell text-xs text-slate-500"
                  >
                    {formatDate(tree.created_at)}
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700"
                    >
                      {tree.total_links || 0}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid={`view-linktree-${tree.id}`}
                        on:click={() => navigate(`/link-trees/${tree.id}`)}
                        class="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        data-testid={`edit-linktree-${tree.id}`}
                        on:click={() => handleEditLinkTree(tree.id)}
                        class="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Ubah Link Tree"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-linktree-${tree.id}`}
                        on:click={() => handleDeleteLinkTree(tree.id)}
                        class="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Link Tree"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <AddModal show={showAddModal} on:close={() => (showAddModal = false)} />
    <ChangeModal
      show={showChangeModal}
      linkTreeId={selectedTreeId}
      on:close={() => (showChangeModal = false)}
    />
  </div>
{/if}
