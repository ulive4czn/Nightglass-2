# Build the Nightglass Windows EXE without installing developer tools on your PC

This project includes a GitHub Actions workflow that builds a portable Windows EXE on a hosted Windows runner. Your PC does not need Node.js for the build, but you do need a GitHub account and to upload this project to a repository.

1. Create a repository at https://github.com/new (a private repository is fine).
2. Upload the contents of this folder to the repository. Make sure `.github/workflows/build-windows.yml` is included. GitHub's web upload may require uploading the files/folders from a desktop browser; alternatively use GitHub Desktop.
3. Open the repository's **Actions** tab. Select **Build Nightglass for Windows** and press **Run workflow**. If the workflow is not listed yet, push/commit the files to the `main` branch first.
4. Wait for the workflow to finish successfully.
5. Open the completed run and download the **Nightglass-Windows-EXE** artifact. Extract the downloaded artifact ZIP; it contains the `.exe`.

This workflow is a build route, not a prebuilt executable. The resulting app will be unsigned, so Windows SmartScreen may warn you. Only run a build you created and trust.
