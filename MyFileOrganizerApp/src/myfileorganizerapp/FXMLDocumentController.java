package myfileorganizerapp;

import com.jfoenix.controls.JFXButton;
import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Iterator;
import java.util.ResourceBundle;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.stage.DirectoryChooser;
import javafx.stage.Stage;

public class FXMLDocumentController implements Initializable {

    ObservableList<Ur> urs;
    @FXML
    private TextField actPath;
    @FXML
    private TextField newPath;
    @FXML
    private Button actptn;
    @FXML
    private Button newbtn;
    @FXML
    private TextField prifix;
    @FXML
    private TableView<Ur> TableUrl;
    @FXML
    private TableColumn<Ur, Integer> IDs;
    @FXML
    private TableColumn<Ur, String> URL;
    @FXML
    private JFXButton nurl;
    static int count = 0;
    @FXML
    private TextField nextDir;
    @FXML
    private TextField prifixmulti;

    // TODO : Multi sort file finction multiSort(ListOfObject, nextpah);
    @Override
    public void initialize(URL url, ResourceBundle rb) {

        if (urs == null) {
            urs = FXCollections.observableArrayList();

        }

        IDs.setCellValueFactory(new PropertyValueFactory<>("ID"));
        URL.setCellValueFactory(new PropertyValueFactory<>("Path"));

    }

    // I think this is a bad function , I will modify it in the feuture  
    @FXML
    private void SelectApath(ActionEvent event) {

        String path = getselectedPath();
        if ((Button) (event.getSource()) == actptn) {
            actPath.setText(path);
            newPath.setText(path);
        } else {
            newPath.setText(path);
        }

    }

    @FXML
    private void Cancel(ActionEvent event) {
        actPath.clear();
        newPath.clear();
        prifix.clear();
    }

    @FXML
    private void Orgnize(ActionEvent event) {
        String actp = actPath.getText().trim();
        String newp = newPath.getText().trim();
        String prifixx = prifix.getText().trim();
        if (actp.isEmpty() || newp.isEmpty() || (!prifixx.isEmpty() && !isFolderNameValid(prifixx))) {
            showAlert(Alert.AlertType.ERROR, "Select All the Pathes ... !");
        } else {

            if (arePathsValid(actp) && arePathsValid(newp)) {
                organizeFiles(actp, newp, prifixx);
            } else {
                showAlert(Alert.AlertType.ERROR, "Path is not valide !");
            }
            ShowResults(newp);
        }
    }

    private String getselectedPath() {

        Stage s = (Stage) actptn.getScene().getWindow();
        DirectoryChooser directoryChooser = new DirectoryChooser();
        directoryChooser.setTitle("Select Directory");

        File selectedDirectory = directoryChooser.showDialog(s);

        if (selectedDirectory != null) {
            // If a directory is selected, get its path and use it in your application logic
            String selectedDirectoryPath = selectedDirectory.getAbsolutePath();
            System.out.println("Selected Directory Path: " + selectedDirectoryPath);
            return selectedDirectoryPath;
        } else {
            showAlert(Alert.AlertType.ERROR, "No directory selected.");
            System.out.println("No directory selected.");
        }
        return null;
    }

    private void showAlert(Alert.AlertType alertType, String message) {
        Alert alert = new Alert(alertType);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    public static boolean arePathsValid(String sourcePath) {

        if (sourcePath == null) {
            return false;
        }
        Path source = Paths.get(sourcePath);

        // Convert the paths to Path objects
        //null path problem
        // Check if the paths exist and are valid
        return Files.exists(source) && Files.isDirectory(source);

        // Return true if both paths are valid, otherwise return false
    }

    public void organizeFiles(String sourceDir, String destinationDir, String prifixx) {
        File sourceDirectory = new File(sourceDir);
        File destinationDirectory = new File(destinationDir);

        if (!destinationDirectory.exists()) {
            destinationDirectory.mkdirs();
        }

        File[] files = sourceDirectory.listFiles();
        System.out.println("file length : " + files.length);
        if (files == null) {
            System.out.println("No files found in the source directory.");
            showAlert(Alert.AlertType.INFORMATION, "No files found in the source directory.");
            return;
        }

        if (!prifixx.isEmpty() && !isFolderNameValid(prifixx)) {
            ShowAlert("Enter Correct prifix ", Alert.AlertType.ERROR);
            prifixx = "";
        }
        String ErrorFileMoving = "";
        for (File file : files) {
            if (file.isFile()) {
                String fileName = file.getName();
                String extension = getFileExtension(fileName);

                if (extension != null) {
                    // Create a new directory based on the file extension
                    File newDir = new File(destinationDirectory + File.separator + prifixx + extension);
                    newDir.mkdirs();

                    // Move the file to the corresponding directory
                    Path sourcePath = Paths.get(file.getAbsolutePath());
                    Path destinationPath = Paths.get(newDir.getAbsolutePath() + File.separator + fileName);
                    try {
                        Files.move(sourcePath, destinationPath);
                        System.out.println("Moved " + fileName + " to " + newDir.getName());
                    } catch (IOException e) {
//                        System.out.println("Error moving " + fileName + ": " + e.getMessage());
//                        showAlert(Alert.AlertType.ERROR, e.getMessage());
                        ErrorFileMoving = ErrorFileMoving + "\n" + fileName;
                    }
                }
            }
        }
        if (!ErrorFileMoving.isEmpty()) {
            showAlert(Alert.AlertType.ERROR, "We already have these files in the folder. Please check for duplicates.\n " + ErrorFileMoving);
        }

        //openFileExplorer(destinationDir);
    }

    private static String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex != -1 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(lastDotIndex + 1).toLowerCase();
        }
        return null;
    }

    public static boolean isFolderNameValid(String folderName) {
        // Define the regular expression pattern for valid folder names
        // This pattern allows letters, numbers, underscores, hyphens, and spaces
        Pattern pattern = Pattern.compile("^[a-zA-Z0-9_\\- ]+$");
        Matcher matcher = pattern.matcher(folderName);

        // Check if the folder name matches the pattern
        return matcher.matches();
    }

    private void openFileExplorer(String path) {
        File directory = new File(path);

        if (!directory.exists() || !directory.isDirectory()) {
            System.out.println("Invalid directory path: " + path);
            return;
        }

        try {
            Desktop.getDesktop().open(directory);
        } catch (IOException e) {
            System.out.println("Error opening file explorer: " + e.getMessage());
        }
    }

    private void ShowResults(String path) {

        // Create a new Yes/No alert
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle("Files organized successfully.");
        alert.setHeaderText("Files organized successfully\nDo you want to See the results ?");
        //alert.setContentText("Click Yes to proceed or No to cancel.");

        // Set the button types for Yes and No options
        ButtonType buttonTypeYes = new ButtonType("Yes");
        ButtonType buttonTypeNo = new ButtonType("No");
        alert.getButtonTypes().setAll(buttonTypeYes, buttonTypeNo);

        // Show the alert and wait for the user's response
        alert.showAndWait().ifPresent((ButtonType response) -> {
            if (response == buttonTypeYes) {

                openFileExplorer(path);
                // Your code to handle Yes option goes here
            } else if (response == buttonTypeNo) {
                System.out.println("User clicked No.");
                alert.close();
            }
        });

    }

//-----------------------------------------------------------------------------------
    @FXML
    private void ClearTable(ActionEvent event) {
        TableUrl.getItems().removeAll(TableUrl.getItems());
        nextDir.clear();
        prifixmulti.clear();

    }

    @FXML
    private void AddNewUrl(ActionEvent event) {

        String path = getselectedPath();
        if (arePathsValid(path)) {
            OnTheTable(path);
        }

    }

    @FXML
    private void OrgnizeMultiUrl(ActionEvent event) {

        String targetPath = nextDir.getText().trim();
        String prifx = prifixmulti.getText().trim();
        if (!arePathsValid(targetPath) || targetPath.equals("") || (!prifx.isEmpty() && !isFolderNameValid(prifx))) {
            ShowAlert("Select a valid path ... !", Alert.AlertType.ERROR);
        } else {
            System.out.println("Target Path is : " + targetPath);
            ObservableList<Ur> s = TableUrl.getItems();
            organizeMultiFiles(s, targetPath, prifx);

            ShowResults(targetPath);
            // openFileExplorer(targetPath);

        }

    }

    private void OnTheTable(String path) {

        urs.add(new Ur(count++, path));

        TableUrl.setItems(urs);

    }

//    private Callback<TableColumn<Ur, Void>, TableCell<Ur, Void>> createActionCellFactory() {
//        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
//    }
    @FXML
    private void deleteUrl(ActionEvent event) {

        Ur selectedItem = TableUrl.getSelectionModel().getSelectedItem();

        // Check if an item is selected
        if (selectedItem != null) {
            // Remove the selected item from the data source
            urs.remove(selectedItem);

            // Refresh the TableView to reflect the changes
            TableUrl.refresh();
        }
    }

    private void ShowAlert(String ErrorMessage, Alert.AlertType type) {
        Alert alert = new Alert(type);
        alert.setHeaderText(null); // By setting this to null, the header text will not be displayed
        alert.setContentText(ErrorMessage);

        // Show and wait for the user to close the dialog
        alert.showAndWait();
    }

    @FXML
    private void ToTheFolder(ActionEvent event) {
        System.out.println("--------------->TotheFOLDER");
        String s = getselectedPath();
        if (arePathsValid(s)) {
            nextDir.setText(s);
        }
    }

    public static Set<String> removeDuplicates(ObservableList<Ur> objs) {
        Set<String> uniquePaths = new HashSet<>();
        Iterator<Ur> iterator = objs.iterator();

        while (iterator.hasNext()) {
            Ur obj = iterator.next();
            if (uniquePaths.contains(obj.getPath())) {
                iterator.remove(); // Remove the object with duplicate path
            } else {
                uniquePaths.add(obj.getPath());
            }
        }
        return uniquePaths;
    }

    public void organizeMultiFiles(ObservableList<Ur> urList, String destinationDir, String prifixx) {
        File destinationDirectory = new File(destinationDir);

        if (!destinationDirectory.exists()) {
            destinationDirectory.mkdirs();
        }

        for (Ur urObject : urList) {
            String sourceDir = urObject.getPath();
            File sourceDirectory = new File(sourceDir);
            File[] files = sourceDirectory.listFiles();

            if (files == null || files.length == 0) {
                System.out.println("No files found in the source directory: " + sourceDir);
                showAlert(Alert.AlertType.INFORMATION, "No files found in the source directory: " + sourceDir);
                continue;  // move to the next source directory in the list
            }

            System.out.println("file length for " + sourceDir + " : " + files.length);

            for (File file : files) {
                if (file.isFile()) {
                    String fileName = file.getName();
                    String extension = getFileExtension(fileName);

                    if (extension != null) {
                        // Create a new directory based on the file extension
                        File newDir = new File(destinationDirectory + File.separator + prifixx + extension);
                        newDir.mkdirs();

                        // Move the file to the corresponding directory
                        Path sourcePath = Paths.get(file.getAbsolutePath());
                        Path destinationPath = Paths.get(newDir.getAbsolutePath() + File.separator + fileName);
                        try {
                            Files.move(sourcePath, destinationPath);
                            System.out.println("Moved " + fileName + " to " + newDir.getName());
                        } catch (IOException e) {
                            System.out.println("Error moving " + fileName + ": " + e.getMessage());
                            showAlert(Alert.AlertType.ERROR, e.getMessage());
                        }
                    }
                }
            }
        }

        // openFileExplorer(destinationDir);
    }

}
