package expo.modules;

import java.util.Arrays;
import java.util.List;
import expo.modules.core.interfaces.Package;
import expo.modules.kotlin.modules.Module;
import expo.modules.kotlin.ModulesProvider;

public class ExpoModulesPackageList implements ModulesProvider {
  private static class LazyHolder {
    static final List<Package> packagesList = Arrays.<Package>asList(
      new expo.modules.adapters.react.ReactAdapterPackage(),
      new expo.modules.constants.ConstantsPackage(),
      new expo.modules.core.BasePackage(),
      new expo.modules.filesystem.legacy.FileSystemPackage(),
      new expo.modules.keepawake.KeepAwakePackage(),
      new expo.modules.kotlin.edgeToEdge.EdgeToEdgePackage()
    );

    static final List<Class<? extends Module>> modulesList = Arrays.<Class<? extends Module>>asList(
            expo.modules.fetch.ExpoFetchModule.class,
      expo.modules.asset.AssetModule.class,
      expo.modules.constants.ConstantsModule.class,
      expo.modules.filesystem.FileSystemModule.class,
      expo.modules.filesystem.legacy.FileSystemLegacyModule.class,
      expo.modules.font.FontLoaderModule.class,
      expo.modules.font.FontUtilsModule.class,
      expo.modules.keepawake.KeepAwakeModule.class,
      MediaListenerModule.class
    );
  }

  public static List<Package> getPackageList() {
    return LazyHolder.packagesList;
  }

  @Override
  public List<Class<? extends Module>> getModulesList() {
    return LazyHolder.modulesList;
  }
}
