const { Octokit } = require("octokit");

function CpkAutomated () {
    this.owner = "";
    this.myOctokit = null

    this.init = (owner, auth) => {
        this.myOctokit = new Octokit({ auth: auth });
        this.owner = owner;
        return this;
    };

    this.newRepo = (name, isPrivate) => {
        return this.myOctokit.request('POST /user/repos', {
            name: name,
            'private': isPrivate,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
    };

    this.addNewFileToRepo = (repoName, path, commitMessage, content) => {
        return this.myOctokit.request.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: this.owner,
            repo: 'REPO',
            path: 'PATH',
            message: 'my commit message',
            content: 'bXkgbmV3IGZpbGUgY29udGVudHM=',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
    }


    
}

const template = `name: cpp-cmake-mingw-prebuilt-release-actions-workflow
on:
  push:
    # Sequence of patterns matched against refs/tags
    tags:
      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10
      - 'c*'

jobs:
  build:
    strategy:
      matrix:
        compiler:
        - {
            name: "x86_64-8.1.0-release-posix-seh-rt_v6-rev0",
            url: "https://github.com/dirkarnez/cpp-tools/raw/main/x86_64-8.1.0-release-posix-seh-rt_v6-rev0.7z"
          }
        - {
            name: "winlibs-x86_64-posix-seh-gcc-11.2.0-mingw-w64-9.0.0-r1",
            url: "https://github.com/brechtsanders/winlibs_mingw/releases/download/11.2.0-12.0.1-9.0.0-r1/winlibs-x86_64-posix-seh-gcc-11.2.0-mingw-w64-9.0.0-r1.zip"
          }
        # - {
        #     name: "msvc2019"
        #   }

    runs-on: windows-latest
    env:
      libraryName: superlu
      cmakeInstallationPath: superlu-installation
      tagName: v6.0.1
    steps:
    
      - uses: actions/checkout@v4
        with:
          repository: xiaoyeli/superlu
          ref: \${{ env.tagName }}
          path: \${{ env.libraryName }}
          submodules: true
          
      - name: download compiler
        if: \${{  matrix.compiler.url }}
        shell: cmd
        run: |
          curl \${{ matrix.compiler.url }} -L --output compiler &&^
          7z.exe x compiler
          
      - name: curl cmake-3.24.0-windows-x86_64.zip
        shell: cmd
        run: curl https://github.com/Kitware/CMake/releases/download/v3.24.0/cmake-3.24.0-windows-x86_64.zip -L --output cmake-3.24.0-windows-x86_64.zip && dir && 7z.exe x cmake-3.24.0-windows-x86_64.zip

      - name: curl PortableGit-2.38.1-64-bit.7z.exe
        shell: cmd
        run: curl https://github.com/git-for-windows/git/releases/download/v2.38.1.windows.1/PortableGit-2.38.1-64-bit.7z.exe -L --output PortableGit-2.38.1-64-bit.7z.exe && dir && 7z.exe x PortableGit-2.38.1-64-bit.7z.exe -o"PortableGit-2.38.1-64-bit"
      
      # - shell: cmd
      #   run: |
      #     cd /d "\${{ github.workspace }}\\cmake-3.24.0-windows-x86_64\\share\\cmake-3.24\\Modules\\" &&^
      #     del /f FindOpenSSL.cmake &&^
      #     dir
          
      # - shell: cmd
      #   run: |
      #     cd \${{ env.libraryName }} &&^
      #     dir &&^
      #     "\${{ github.workspace }}\PortableGit-2.38.1-64-bit\usr\bin\sed.exe" -i "s/cmake_minimum_required(VERSION\s\+2.6.0)/cmake_minimum_required(VERSION 3.7)/g" CMakeLists.txt &&^
      #     "\${{ github.workspace }}\PortableGit-2.38.1-64-bit\usr\bin\sed.exe" -i "s/find_package(OpenSSL)/find_package(OpenSSL CONFIG REQUIRED)/g" CMakeLists.txt &&^
      #     "\${{ github.workspace }}\PortableGit-2.38.1-64-bit\usr\bin\sed.exe" -i "s/add_subdirectory(doc)//g" CMakeLists.txt &&^
      #     type CMakeLists.txt
          
      # - shell: cmd
      #   run: |
      #     curl https://github.com/dirkarnez/openssl-prebuilt/releases/download/v3.1.3/openssl-v3.1.3-x86_64-8.1.0-release-posix-seh-rt_v6-rev0.zip -L -O &&^
      #     7z.exe x openssl-v3.1.3-x86_64-8.1.0-release-posix-seh-rt_v6-rev0.zip -o"openssl-v3.1.3-x86_64-8.1.0-release-posix-seh-rt_v6-rev0"

      # - shell: cmd
      #   run: |
      #     curl https://github.com/dirkarnez/zlib-prebuilt/releases/download/v1.2.13/zlib-v1.2.13-mingw64-x86_64-posix-seh-rev0-8.1.0.zip -L -O &&^
      #     7z.exe x zlib-v1.2.13-mingw64-x86_64-posix-seh-rev0-8.1.0.zip -o"zlib-v1.2.13-mingw64-x86_64-posix-seh-rev0-8.1.0"
          
      # - name: set PATH, check mingw version, cmake generate, build and install
      #   if: \${{ !matrix.compiler.url }}
      #   shell: cmd
      #   run: |
      #       set PATH=^
      #       \${{ github.workspace }}\mingw64;^
      #       \${{ github.workspace }}\mingw64\bin;^
      #       \${{ github.workspace }}\cmake-3.24.0-windows-x86_64\bin;
      #       set CD_LINUX=%CD:\=/%
      #       cd libsoda-cxx &&^
      #       cmake.exe -G "Visual Studio 17 2022" -A x64 ^
      #       -DCMAKE_BUILD_TYPE=Release ^
      #       -DBUILD_SHARED_LIBS=OFF ^
      #       -DCMAKE_INSTALL_PREFIX="cmake-build/\${{ env.cmakeInstallationPath }}" -B./cmake-build &&^
      #       cd cmake-build && cmake --build . --config Release && cmake --install . 
            
      - name: set PATH, check mingw version, cmake generate, build and install
        if: \${{ matrix.compiler.url }}
        shell: cmd
        run: |
            set PATH=^
            \${{ github.workspace }}\mingw64;^
            \${{ github.workspace }}\mingw64\bin;^
            \${{ github.workspace }}\cmake-3.24.0-windows-x86_64\bin;
            set CD_LINUX=%CD:\=/%
            gcc --version &&^
            cd \${{ env.libraryName }} &&^
            cmake.exe -G"MinGW Makefiles" ^
            -DCMAKE_BUILD_TYPE=Release ^
            -DBUILD_SHARED_LIBS=OFF ^
            -DCMAKE_INSTALL_PREFIX="cmake-build/\${{ env.cmakeInstallationPath }}" -B./cmake-build &&^
            cd cmake-build && ( cmake --build . --config Release && cmake --install .  || type .\CMakeFiles\CMakeError.log )  
 
  # -DOpenSSL_DIR="%CD_LINUX%/openssl-v3.1.3-x86_64-8.1.0-release-posix-seh-rt_v6-rev0" ^
  # -DZLIB_ROOT="%CD_LINUX%/zlib-v1.2.13-mingw64-x86_64-posix-seh-rev0-8.1.0" ^
  # -DZLIB_USE_STATIC_LIBS=ON ^
  
      - name: Archive Release
        uses: thedoctor0/zip-release@master
        with:
          type: 'zip'
          directory: "\${{ env.libraryName }}/cmake-build/\${{ env.cmakeInstallationPath }}"
          filename: "\${{ env.libraryName }}-\${{ github.ref_name }}-\${{ matrix.compiler.name }}.zip"
        
      - name: Release prebuilt
        uses: ncipollo/release-action@v1
        with:
          artifacts: "\${{ env.libraryName }}/cmake-build/\${{ env.cmakeInstallationPath }}/\${{ env.libraryName }}-\${{ github.ref_name }}-\${{ matrix.compiler.name }}.zip"
          allowUpdates: true
          token: \${{ secrets.GITHUB_TOKEN }}
`
// export default CpkAutomated;

(() => {
    const cpk = new CpkAutomated().init("dirkarnez", "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");
    cpk
    .newRepo("testing2", false)
    .then(response => {
        const repoName = response.data.name;
        return cpk.addNewFileToRepo(repoName, ".github/workflows/build.yml", "- add .github/workflows/build.yml", template)
    })
    .then(response => {

    });
})()